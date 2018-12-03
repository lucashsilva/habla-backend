import { ProfileVotePost } from "../models/profile-vote-post";

export const ProfileVotePostTypeDef = `
  extend type Mutation {
    vote(postId: ID!, type: PostVoteType!): PostVote!
  }

  type PostVote {
    postId: ID!
    profileUid: ID!
  }

  enum PostVoteType {
    UP
    DOWN
  }
`;

export const ProfileVotePostResolvers = {
  Mutation: {
    vote: async(parent, args, context) => {
      const { postId, type } = args;

      const profileUid = context.user.uid;
      const pvp = await ProfileVotePost.findOne({ postId, profileUid }) || ProfileVotePost.create({ postId, profileUid });

      pvp.type = type;
      
      return await pvp.save();
    }
  }
};