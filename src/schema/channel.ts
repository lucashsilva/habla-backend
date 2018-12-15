import { Post } from "../models/post";
import { Channel } from "../models/channel";
export const ChannelTypeDef = `
  extend type Query {
    channels: [Channel!]!
  }

  input ChannelInput {
    name: String!
  }

  extend type Mutation {
    createChannel(channel: ChannelInput!): Channel!
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
  Mutation: {
    createChannel: async(parent, args) => {
      return await Channel.create(args.channel).save(); 
    }
  },
  Channel: {
    posts: async(channel: Channel) => {
      return await Post.find({ where: { channel: channel }, order: { createdAt: 'DESC' }});
    }
  }
};