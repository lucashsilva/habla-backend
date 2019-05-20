import { ProfileFollowPost } from "../models/profile-follow-post";
import { getConnection } from "typeorm";
import { Post } from "../models/post";
import { InvalidOperationError } from "../errors/invalid-operator-error";
import { NotFoundError } from "../errors/not-found-error";

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
      let profileFollowPost = await ProfileFollowPost.findOne(args.postId, context.user.id);

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
        throw new NotFoundError("Post not found.");
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
        throw new InvalidOperationError("You can not subscribe to a post owned by yourself.");
      }
    }
  }

}