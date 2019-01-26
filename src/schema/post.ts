import { Post } from "../models/post";
import { Profile } from "../models/profile";
import { Comment } from "../models/comment";
import { Channel } from "../models/channel";
import { getMaskedDistance } from "../util/geo";
import { ProfileVotePost } from "../models/profile-vote-post";
import { IsNull } from "typeorm";
import { requireLocationInfo } from "../util/context";
import { NotFoundError } from "../errors/not-found-error";
import { AuthorizationError } from "../errors/authorization-error";

export const PostTypeDef = `
  extend type Query {
    posts(radius: Float, channelId: ID, skip: Int, take: Int): [Post!]!
    post(id: ID!): Post
  }

  input PostInput {
    body: String!
  }

  extend type Mutation {
    createPost(channelId: ID, post: PostInput!, anonymous: Boolean): Post!
    deletePost(postId: ID!): Boolean!
  }

  type Post {
    id: ID!
    body: String!
    distance: String!
    createdAt: Date!
    anonymous: Boolean!
    owner: Profile
    channel: Channel
    comments: [Comment!]!
    commentsCount: Int!
    rate: Int!
    profilePostVote: PostVote
  }
`;

export const PostResolvers = {
  Query: {
    posts: async(parent, args, context) => {
      requireLocationInfo(context);

      const query = Post.createQueryBuilder("post")
                        .where(`post.deletedAt IS NULL and ST_DWithin(post.location::geography, ST_GeomFromText('POINT(${context.location.latitude} ${context.location.longitude})', 4326)::geography, ${args.radius || 10000})`)
                        .skip(args.skip)
                        .take(args.take)
                        .orderBy("post.createdAt", "DESC");

      if (args.channelId) {
        query.andWhere(`post.channelId = ${args.channelId}`);
      }
      
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
    channel: async(post: Post) => {
      return post.channelId? await Channel.findOne(post.channelId): null;
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

      const post = args.post;

      if (!args.anonymous) {
        post.ownerUid = context.user.uid;
      } 

      post.channelId = args.channelId;

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      post.location = location;

      return await Post.create(post).save();
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