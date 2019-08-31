import { ProfileFollowPost } from "../models/profile-follow-post";
import { Post } from "../models/post";
import { HablaError } from "../errors/habla-error";
import HablaErrorCodes from "../errors/error-codes";

export const ProfileFollowPostTypeDef = `
  extend type Query {
    profileFollowsPost(postId: ID!): Boolean
  }

  extend type Mutation {
    togglePostFollow(postId: ID!): ProfileFollowPost
  }

  type ProfileFollowPost {
    postId: ID!
    profileUid: String!
  }
`

export const ProfileFollowPostResolvers = {
  Query: {
    profileFollowsPost: async (parent, args, context) => {
      let profileFollowPost = await ProfileFollowPost.findOne({ postId: args.postId, profileUid: context.user.uid });

      if (profileFollowPost) {
        return true;
      } else {
        return false;
      }
    }
  },
  Mutation:{
    togglePostFollow: async(parent, args, context) => {
      const { postId } = args;

      let post = await Post.findOne({id: postId});

      if (!post) {
        throw new HablaError("Post not found.", HablaErrorCodes.NOT_FOUND_ERROR);
      }

      if (post.ownerUid !== context.user.uid) {
        const profileUid = context.user.uid;
        
        let pfp = await ProfileFollowPost.findOne({ postId, profileUid });

        if (pfp) {
          await pfp.remove();

          return;
        } else {
          pfp = await ProfileFollowPost.create({ postId, profileUid }).save();

          return pfp;
        }
      } else {
        throw new HablaError("You can not subscribe to a post owned by yourself.", HablaErrorCodes.INVALID_OPERATION_ERROR);
      }
    }
  }

}