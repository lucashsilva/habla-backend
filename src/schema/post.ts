import { Post } from "../models/post";
import { Profile } from "../models/profile";
import { Comment } from "../models/comment";
import { Channel } from "../models/channel";
import { getMaskedDistance, getExactDistance } from "../util/geo";
import { ProfileVotePost } from "../models/profile-vote-post";
import { IsNull, Not, In, Equal } from "typeorm";
import { requireLocationInfo } from "../util/context";
import { getPhotoDataWithBufferFromBase64 } from "../util/photo-upload-handler";
import * as admin from 'firebase-admin';
import { ProfileScoreRecord, ProfileScoreRecordType } from "../models/profile-score-record";
import { PostMapChannel } from "../models/post-map-channel";
import { getConnection } from "typeorm";
import { ProfileFollowPost } from "../models/profile-follow-post";
import { Notification } from "../models/notification";
import HablaErrorCodes from "../errors/error-codes";
import { HablaError } from "../errors/habla-error";
import { ProfileRevealPost } from "../models/profile-reveal-post";

export const PostTypeDef = `
  extend type Query {
    posts(radius: Float, channelId: ID, limit: Int, ignoreIds: [ID!]): [Post!]!
    post(id: ID!): Post
  }

  input PostInput {
    body: String!
    anonymous: Boolean!
  }

  extend type Mutation {
    createPost(channelId: ID, post: PostInput!, photo: Upload): Post!
    deletePost(postId: ID!): Boolean!
  }

  type Post {
    id: ID!
    body: String!
    distance: String!
    exactDistance: Float
    createdAt: Date!
    anonymous: Boolean!
    owner: Profile
    channels: [Channel!]!
    comments: [Comment!]!
    commentsCount: Int!
    rate: Int!
    voteCount: Int!
    profilePostVote: PostVote
    photoURL: String
    postFollowers: [Profile!]!
    profileFollowPost: ProfileFollowPost
    profileRevealPosts: [ProfileRevealPost!]!
  }
`;

export const PostResolvers = {
  Query: {
    posts: async (parent, args, context) => {
      requireLocationInfo(context);

      const query = Post.createQueryBuilder("post")
        .limit(args.limit || 20)
        .orderBy("post.createdAt", "DESC");

      args.ignoreIds && args.ignoreIds.length && query.where({ id: Not(In(args.ignoreIds)) }); // andWhere is not working with object literals so let's use where

      query.andWhere(`post.deletedAt IS NULL and ST_DWithin(post.location::geography, ST_GeomFromText('POINT(${context.location.latitude} ${context.location.longitude})', 4326)::geography, ${args.radius || 10000})`);

      args.channelId && query.andWhere(qb => `EXISTS${qb.subQuery()
        .select()
        .from(PostMapChannel, "pmc")
        .where(`post.id = pmc.postId AND pmc."channelId" = ${args.channelId}`)
        .getQuery()}`);

      return query.getMany();
    },
    post: async (parent, args) => {
      return await Post.findOne({ where: { id: args.id, deletedAt: IsNull() } });
    }
  },
  Post: {
    owner: async (post: Post, args, context) => {
      return !post.anonymous || post.ownerUid == context.user.uid? Profile.findOne(post.ownerUid) : null;
    },
    comments: async (post: Post) => {
      return await Comment.find({ where: { post: post }, order: { createdAt: 'DESC' } });
    },
    channels: async (post: Post) => {
      return await Post.createQueryBuilder()
        .relation(Post, "channels")
        .of(post)
        .loadMany();
    },
    distance: (post, args, context) => {
      requireLocationInfo(context);

      return getMaskedDistance({ latitude: post.location.coordinates[0], longitude: post.location.coordinates[1] }, { latitude: context.location.latitude, longitude: context.location.longitude });
    },
    exactDistance: async(post, args, context) => {
      requireLocationInfo(context);
      
      return post.ownerUid === context.user.uid || (await ProfileRevealPost.count({ postId: post.id, profileUid: context.user.uid, type: "EXACT_DISTANCE" }))? getExactDistance(context.location, { latitude: post.location.coordinates[0], longitude: post.location.coordinates[1] }): null;
    },
    commentsCount: async (post: Post) => {
      return await Comment.count({ post: post });
    },
    rate: async (post: Post) => {
      return (await ProfileVotePost.count({ post: post, type: "UP" })) - (await ProfileVotePost.count({ post: post, type: "DOWN" }));
    },
    voteCount: async (post: Post) => {
      return ProfileVotePost.count({ post });
    },
    profilePostVote: async (post: Post, args, context) => {
      return await ProfileVotePost.findOne({ postId: post.id, profileUid: context.user.uid });
    },
    postFollowers: async (post: Post) => {
      return await Post.createQueryBuilder()
        .relation(Post, "postFollowers")
        .of(post)
        .loadMany();
    },
    profileFollowPost: async (post: Post, args, context) => {
      return await ProfileFollowPost.findOne({ postId: post.id, profileUid: context.user.uid });
    },
    profileRevealPosts: async(post: Post, args, context) => {
      return await ProfileRevealPost.createQueryBuilder()
        .select()
        .where({ postId: post.id, profileUid: context.user.uid })
        .getMany();
    }
  },
  Mutation: {
    createPost: async (parent, args, context) => {
      requireLocationInfo(context);

      let post: Post = await Post.create(args.post);

      post.ownerUid = context.user.uid;

      let profile = await Profile.findOne({uid: post.ownerUid});
      if(!profile.premium){
        if (post.anonymous) {
          const result = await ProfileScoreRecord.createQueryBuilder("record")
            .select("SUM(value)", "scoreBalance")
            .where({ profileUid: Equal(context.user.uid) })
            .getRawOne();

          let score = result.scoreBalance;
        
          if (score < Math.abs(ProfileScoreRecord.POINTS.CREATED_ANONYMOUS_POST)) {
            throw new HablaError('Insufficient score to make an anonymous post.', HablaErrorCodes.INSUFFICENT_SCORE_ERROR);
          }
        }
      }

      const location = context.location ? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] } : null;
      post.location = location;

      await getConnection().transaction(async transactionalEntityManager => {
        post = await Post.create(post);

        await transactionalEntityManager.save(Post, post);

        let photoURL;

        if (args.photo) {

          let photoData = getPhotoDataWithBufferFromBase64(args.photo, `${context.user.uid}` + `${post.id}` + `-original`);

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
            throw new HablaError('Post picture could not be saved.', HablaErrorCodes.INTERNAL_SERVER_ERROR);
          }
        }

        post.photoURL = photoURL;

        post.channels = [];

        let hashtags = post.body.match(/(?<=^|(?<=[^a-zA-Z0-9-_\\.]))#([A-Za-z]+[A-Za-z0-9_]+)/g);

        if (hashtags && hashtags.length) await Promise.all(hashtags.map(async h => {
          const name = h.substr(1);
          let channel = await Channel.findOne({ name });

          if (!channel) {
            channel = await Channel.create({ name });
            await transactionalEntityManager.save(Channel, channel);
          }

          post.channels.push(channel);
        }));

        post = await transactionalEntityManager.save(Post, post);

        let profileScoreRecord = null;
        
        if(!profile.premium){
          if (!post.anonymous) {
            profileScoreRecord = await ProfileScoreRecord.create({ type: ProfileScoreRecordType.CREATED_PUBLIC_POST, profileUid: context.user.uid, post, value: ProfileScoreRecord.POINTS.CREATED_PUBLIC_POST });
          } else {
            profileScoreRecord = await ProfileScoreRecord.create({ type: ProfileScoreRecordType.CREATED_ANONYMOUS_POST, profileUid: context.user.uid, post, value: ProfileScoreRecord.POINTS.CREATED_ANONYMOUS_POST });
          }
          await transactionalEntityManager.save(ProfileScoreRecord, profileScoreRecord);
        }
      });
      return post;
    },
    deletePost: async (parent, args, context) => {
      let post = await Post.findOne(args.postId);
      if (!post) {
        throw new HablaError("Post not found.", HablaErrorCodes.NOT_FOUND_ERROR)
      } else if (post.ownerUid !== context.user.uid) {
        throw new HablaError("User is not authorized to make changes to this resource.", HablaErrorCodes.AUTHORIZATION_ERROR);
      } else {
        post.deletedAt = new Date(Date.now());

        await post.save();
        await Notification.delete({ post });
        return true;
      }
    }
  }
};