import { Post } from "../models/post";
import { Channel } from "../models/channel";
import { requireLocationInfo } from "../util/context";
import { Not, In } from "typeorm";
export const ChannelTypeDef = `
  extend type Query {
    channels(radius: Int, searchString: String, skip: Int, take: Int, ignoreIds: [Int!]): [Channel!]!
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
    posts: [Post!]!
    postsCount: Int!
  }
`;

export const ChannelResolvers = {
  Query: {
    channels: async(parent, args, context) => {
      requireLocationInfo(context);

      const queryBuilder = Channel.createQueryBuilder("channel");
      
      const query = queryBuilder
                  .select()
                  .addSelect(queryBuilder.subQuery()
                                         .from(Post, "post")
                                         .select("COUNT(*)")
                                         .where("post.channelId = channel.id")
                                         .andWhere(`post.deletedAt IS NULL and ST_DWithin(post.location::geography, ST_GeomFromText('POINT(${context.location.latitude} ${context.location.longitude})', 4326)::geography, ${args.radius || 10000})`)
                                         .getQuery(), "postsCount")
                  .skip(args.skip)
                  .take(args.take)
                  .orderBy(`"postsCount"`, "DESC");

      args.ignoreIds && args.ignoreIds.length && query.where({ id: Not(In(args.ignoreIds)) });
      args.searchString && query.andWhere(`channel.name ILIKE '%${args.searchString}%'`);
      
      const rawAndEntities = await query.getRawAndEntities();

      return rawAndEntities.entities.map((entity, index) => {
        return { postsCount: rawAndEntities.raw[index].postsCount, ... entity };
      });
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