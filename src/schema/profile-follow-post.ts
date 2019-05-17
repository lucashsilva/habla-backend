import { ProfileFollowPost } from "../models/profile-follow-post";
import { getConnection } from "typeorm";
import { AuthorizationError } from "../errors/authorization-error";
import { Post } from "../models/post";

export const ProfileFollowPostTypeDef = `
  extend type Query {
    followOrUnfollow(postId: ID!): Boolean
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
    followOrUnfollow: async (parent, args, context) => {
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

      let post = await Post.findOne({ id: postId })

      if(post.ownerUid !== context.user.uid){
        const profileUid = context.user.uid;
        const pfp = ProfileFollowPost.create({ postId, profileUid });
  
        await getConnection().transaction(async transactionalEntityManager => {
          await transactionalEntityManager.save(pfp);
        });
  
        return pfp;

      }else{
        throw new AuthorizationError();
      }
    },

    unfollow: async(parent, args, context) => {
      const { postId  } = args;

      const profileUid = context.user.uid;
      let pfp = ProfileFollowPost.findOne({ postId, profileUid });

      if(pfp){
        ProfileFollowPost.delete({postId, profileUid});
        return true;
      }

      return false;
    }
  }

}