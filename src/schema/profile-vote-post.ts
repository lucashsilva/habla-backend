import { ProfileVotePost } from "../models/profile-vote-post";
import { Post } from "../models/post";
import { Profile } from "../models/profile";

export const ProfileVotePostTypeDef = `
  extend type Mutation {
    vote(postId: ID!, type: PostVoteType!): PostVote!
  }

  type PostVote {
    post: Post!
    profile: Profile!
    type: PostVoteType
  }

  enum PostVoteType {
    UP
    DOWN
  }
`;

export const ProfileVotePostResolvers = {
  PostVote: {
    post: async(profileVotePost: ProfileVotePost) => {
      return await Post.findOne(profileVotePost.postId);
    },
    profile: async(profileVotePost: ProfileVotePost) => {
      return await Profile.findOne(profileVotePost.profileUid);
    }
  },
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