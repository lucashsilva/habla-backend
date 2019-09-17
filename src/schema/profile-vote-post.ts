import { ProfileVotePost } from "../models/profile-vote-post";
import { Post } from "../models/post";
import { Profile } from "../models/profile";
import { ProfileScoreRecord, ProfileScoreRecordType } from "../models/profile-score-record";
import { Equal } from "typeorm";
import { getConnection } from "typeorm";
import { NotificationService } from "../services/notification";
import { HablaError } from "../errors/habla-error";
import HablaErrorCodes from "../errors/error-codes";


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
    post: async (profileVotePost: ProfileVotePost) => {
      return await Post.findOne(profileVotePost.postId);
    },
    profile: async (profileVotePost: ProfileVotePost) => {
      return await Profile.findOne(profileVotePost.profileUid);
    }
  },
  Mutation: {
    vote: async (parent, args, context) => {
      const { postId, type } = args;

      if (!await Post.count({ id: args.postId })) {
        throw new HablaError("No post with the provided id was not found.", HablaErrorCodes.NOT_FOUND_ERROR);
      }

      const profileUid = context.user.uid;
      const pvp = await ProfileVotePost.findOne({ postId, profileUid }) || ProfileVotePost.create({ postId, profileUid });
      pvp.type = type;

      let profile = await Profile.findOne({ uid: profileUid });

      await getConnection().transaction(async transactionalEntityManager => {
        await transactionalEntityManager.save(pvp);

        await NotificationService.notifyVoteActivity(pvp, transactionalEntityManager);

        if (!profile.premium) {
          const scoreRecord = await ProfileScoreRecord.createQueryBuilder("record")
            .where({ profileUid: Equal(context.user.uid), postId: Equal(postId), type: Equal(ProfileScoreRecordType.VOTED_POST) })
            .getCount();


          if (!scoreRecord) {
            let profileScoreRecord = await ProfileScoreRecord.create({ type: ProfileScoreRecordType.VOTED_POST, profileUid: context.user.uid, postId, value: ProfileScoreRecord.POINTS.VOTED_POST });
            await transactionalEntityManager.save(ProfileScoreRecord, profileScoreRecord);
          }
        }
    });

      return pvp;
    }
  }
};