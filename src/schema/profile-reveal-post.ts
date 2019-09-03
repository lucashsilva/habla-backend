import { Post } from "../models/post";
import { HablaError } from "../errors/habla-error";
import HablaErrorCodes from "../errors/error-codes";
import { ProfileRevealPost } from "../models/profile-reveal-post";
import { ProfileScoreRecord, ProfileScoreRecordType } from "../models/profile-score-record";
import { Equal, getConnection } from "typeorm";

export const ProfileRevealPostTypeDef = `
  extend type Query {
    profileRevealPosts(postId: ID!): [ProfileRevealPost!]!
  }

  extend type Mutation {
    revealPost(postId: ID!, type: ProfileRevealPostType!): ProfileRevealPost!
  }

  type ProfileRevealPost {
    postId: ID!
    post: Post!
    profileUid: String!
    type: ProfileRevealPostType!
  }

  enum ProfileRevealPostType {
    EXACT_DISTANCE
  }
`

export const ProfileRevealPostResolvers = {
  Query: {
    profileRevealPosts: async (parent, args, context) => {
      return ProfileRevealPost.find(args);
    }
  },
  ProfileRevealPost: {
    post: async (parent: ProfileRevealPost, args, context) => {
      return Post.findOne(parent.postId);
    }
  },
  Mutation:{
    revealPost: async(parent, args, context) => {
      const { postId, type } = args;

      let post = await Post.findOne({id: postId});

      if (!post) {
        throw new HablaError("Post not found.", HablaErrorCodes.NOT_FOUND_ERROR);
      }

      if (post.ownerUid !== context.user.uid) {
        const profileUid = context.user.uid;
        
        let prp = await ProfileRevealPost.findOne({ postId, profileUid, type });

        if (prp) {
          // already revealed
          return prp;
        } else {
          const result = await ProfileScoreRecord.createQueryBuilder("record")
            .select("SUM(value)", "scoreBalance")
            .where({ profileUid: Equal(context.user.uid) })
            .getRawOne();

          let score = result.scoreBalance;
          
          if (score < Math.abs(ProfileScoreRecord.POINTS.REVEAL_EXACT_DISTANCE)) {
            throw new HablaError('Insufficient score to reveal post information.', HablaErrorCodes.INSUFFICENT_SCORE_ERROR);
          }

          return await getConnection().transaction(async() => {
            await ProfileScoreRecord.create({ type: ProfileScoreRecordType.REVEAL_EXACT_DISTANCE, profileUid: context.user.uid, post, value: ProfileScoreRecord.POINTS.REVEAL_EXACT_DISTANCE }).save();

            return await ProfileRevealPost.create({ postId, profileUid, type }).save();
          });
        }
      } else {
        throw new HablaError("You can not reveal information from a post owned by yourself.", HablaErrorCodes.INVALID_OPERATION_ERROR);
      }
    }
  }

}