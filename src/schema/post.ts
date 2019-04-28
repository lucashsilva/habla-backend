import { Post } from "../models/post";
import { Profile } from "../models/profile";
import { Comment } from "../models/comment";
import { Channel } from "../models/channel";
import { getMaskedDistance } from "../util/geo";
import { ProfileVotePost } from "../models/profile-vote-post";
import { IsNull, Not, In, Brackets } from "typeorm";
import { requireLocationInfo } from "../util/context";
import { NotFoundError } from "../errors/not-found-error";
import { AuthorizationError } from "../errors/authorization-error";
import { getPhotoDataWithBufferFromBase64 } from "../util/photo-upload-handler";
import * as admin from 'firebase-admin';
import { InternalServerError } from "../errors/internal-server-error";
import { ProfileScoreRecord, ProfileScoreRecordType } from "../models/profile-score-record";
import { PostMapChannel } from "../models/post-map-channel";

export const PostTypeDef = `
  extend type Query {
    posts(radius: Float, channelId: ID, limit: Int, ignoreIds: [ID!]): [Post!]!
    post(id: ID!): Post
  }

  input PostInput {
    body: String!
  }

  extend type Mutation {
    createPost(channelId: ID, post: PostInput!, anonymous: Boolean, photo: Upload): Post!
    deletePost(postId: ID!): Boolean!
  }

  type Post {
    id: ID!
    body: String!
    distance: String!
    createdAt: Date!
    anonymous: Boolean!
    owner: Profile
    channels: [Channel!]!
    comments: [Comment!]!
    commentsCount: Int!
    rate: Int!
    profilePostVote: PostVote
    photoURL: String
  }
`;

export const PostResolvers = {
  Query: {
    posts: async(parent, args, context) => {
      requireLocationInfo(context);

      const query = Post.createQueryBuilder("post")
                        .limit(args.limit || 20)
                        .orderBy("post.createdAt", "DESC");

      args.ignoreIds && args.ignoreIds.length && query.where({ id: Not(In(args.ignoreIds)) }); // andWhere is not working with object literals so let's use where

      query.andWhere(`post.deletedAt IS NULL and ST_DWithin(post.location::geography, ST_GeomFromText('POINT(${context.location.latitude} ${context.location.longitude})', 4326)::geography, ${args.radius || 10000})`);

      args.channelId && query.andWhere(qb => `EXISTS${qb.subQuery()
                                                        .from(PostMapChannel, "pmc")
                                                        .where(`post.id = pmc.postId AND pmc."channelId" = ${args.channelId}`)
                                                        .getQuery()}`);

      return query.getMany();
    },
    post: async(parent, args) => {
      return await Post.findOne({ where: { id: args.id, deletedAt: IsNull() }});
    }
  },
  Post: {
    owner: async(post: Post) => {
      return post.ownerUid? await Profile.findOne(post.ownerUid): null;
    },
    anonymous: (post: Post) => {
      return !post.ownerUid;
    },
    comments: async(post: Post) => {
      return await Comment.find({ where: { post: post }, order: { createdAt: 'DESC'}});
    },
    channels: async(post: Post) => {
      return await Post.createQueryBuilder()
                       .relation(Post, "channels")
                       .of(post)
                       .loadMany();
    },
    distance: (post, args, context) => {
      requireLocationInfo(context);

      return getMaskedDistance({ latitude: post.location.coordinates[0], longitude: post.location.coordinates[1] }, { latitude: context.location.latitude, longitude: context.location.longitude });
    },
    commentsCount: async(post: Post) => {
      return await Comment.count({ post: post });
    },
    rate: async(post: Post) => {
      return (await ProfileVotePost.count({ post: post, type: "UP"})) - (await ProfileVotePost.count({ post: post, type: "DOWN"}));
    },
    profilePostVote: async(post: Post, args, context) => {
      return await ProfileVotePost.findOne({ postId: post.id, profileUid: context.user.uid });
    }
  },
  Mutation: {
    createPost: async(parent, args, context) => {
      requireLocationInfo(context);

      let post: Post = await Post.create(args.post);
      
      if (!args.anonymous) {
        post.ownerUid = context.user.uid;
      } 

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      post.location = location;

      let photoURL;

      if (args.photo) {
        let photoData = getPhotoDataWithBufferFromBase64(args.photo, `${context.user.uid}`+`${args.post.body}`+`-original`);

        try {
          let file = admin.storage().bucket().file(`posts-photos/${photoData.fileName}`);
          
          await file.save(photoData.buffer, { 
            metadata: { contentType: photoData.mimeType },
            validation: 'md5'
          });

          photoURL = (await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          }))[0];
        } catch (error) {
          console.log(JSON.stringify(error));
          throw new InternalServerError('Post picture could not be saved.');
        }
      }

      post.photoURL = photoURL;
      
      post.channels = post.body.match(/(?<=^|(?<=[^a-zA-Z0-9-_\\.]))#([A-Za-z]+[A-Za-z0-9_]+)/g).map(h => {
        const channel = new Channel();
        channel.name = h.substr(1);

        return channel;
      });

      post = await post.save();

      if (!args.anonymous) {
        await ProfileScoreRecord.create({ type: ProfileScoreRecordType.CREATED_PUBLIC_POST, profileUid: context.user.uid, post, value: ProfileScoreRecord.POINTS.CREATED_PUBLIC_POST }).save();
      } else {
        await ProfileScoreRecord.create({ type: ProfileScoreRecordType.CREATED_ANONYMOUS_POST, profileUid: context.user.uid, post, value: ProfileScoreRecord.POINTS.CREATED_ANONYMOUS_POST }).save();
      }

      return post;
    },
    deletePost: async(parent, args, context) => {
      let post = await Post.findOne(args.postId);

      if (!post) {
        throw new NotFoundError();
      } else if (post.ownerUid !== context.user.uid) {
        throw new AuthorizationError();
      } else {
        post.deletedAt = new Date(Date.now());
        await post.save();

        return true;
      }
    }
  }
};