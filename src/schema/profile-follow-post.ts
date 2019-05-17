import { ProfileFollowPost } from "../models/profile-follow-post";
import { getConnection } from "typeorm";
import { Post } from "../models/post";
import { InvalidOperationError } from "../errors/invalid-operator-error";

export const ProfileFollowPostTypeDef = `
  extend type Query {
    profileFollowsPost(postId: ID!): Boolean
  }

  extend type Mutation {
    follow(postId: ID!): ProfileFollowPost!
    unfollow(postId: ID!): Boolean!
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
        throw false;
      }
    }
  },
  Mutation:{
    follow: async(parent, args, context) => {
      const { postId } = args;

      let post = await Post.findOne({id: postId})

      if(post.ownerUid !== context.user.uid){
        const profileUid = context.user.uid;
        
        const pfp = await ProfileFollowPost.create({postId, profileUid});
        await ProfileFollowPost.save(pfp);
        
        return pfp;

      }else{
        throw new InvalidOperationError();
      }
    },

    unfollow: async(parent, args, context) => {
      const { postId  } = args;

      const profileUid = context.user.uid;
      let pfp = await ProfileFollowPost.findOne({postId, profileUid});

      if(pfp){
        await ProfileFollowPost.delete({postId, profileUid});
        return true;
      }

      return false;
    }
  }

}