import { Post } from "../models/post";
import { Profile } from "../models/profile";
import { Comment } from "../models/comment";
import { Channel } from "../models/channel";
import { getMaskedDistance } from "../util/geo";

export const PostTypeDef = `
  extend type Query {
    posts(radius: Float, channelId: ID, skip: Int, take: Int): [Post!]!
    post(id: ID!): Post
  }

  input PostInput {
    body: String!
  }

  extend type Mutation {
    createPost(channelId: ID, post: PostInput!): Post!
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
  }
`;

export const PostResolvers = {
  Query: {
    posts: async(parent, args, context) => {
      if (!context.location) return [];

      const query = Post.createQueryBuilder("post")
                        .where(`ST_DWithin(post.location::geography, ST_GeomFromText('POINT(${context.location.latitude} ${context.location.longitude})', 4326)::geography, ${args.radius || 10000})`)
                        .skip(args.skip)
                        .take(args.take)
                        .orderBy("post.createdAt", "DESC");

      if (args.channelId) {
        query.andWhere(`post.channelId = ${args.channelId}`);
      }
      
      return query.getMany();
    },
    post: async(parent, args) => {
      return await Post.findOne(args.id);
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
      if (!(context.location && context.location.latitude && context.location.longitude && post.location && post.location.coordinates)) {
        return "unknown";
      }

      return getMaskedDistance({ latitude: post.location.coordinates[0], longitude: post.location.coordinates[1] }, { latitude: context.location.latitude, longitude: context.location.longitude });
    },
    commentsCount: async(post: Post) => {
      return await Comment.count({ post: post });
    }
  },
  Mutation: {
    createPost: async(parent, args, context) => {
      const post = args.post;

      post.ownerUid = context.user.uid;
      post.channelId = args.channelId;

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      post.location = location;

      return await Post.create(post).save();
    }
  }
};