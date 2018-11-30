import { Post } from "../models/post";
import { Channel } from "../models/channel";
export const ChannelTypeDef = `
  extend type Query {
    channels: [Channel!]!
  }

  type Channel {
    id: ID!
    name: String!
    createdAt: Date!
    posts: [Post!]!
  }
`;

export const ChannelResolvers = {
  Query: {
    channels: async(parent) => {
      return await Channel.find();
    }
  },
  Channel: {
    posts: async(channel: Channel) => {
      return await Post.find({ where: { channel: channel }, order: { createdAt: 'DESC' }});
    }
  }
};