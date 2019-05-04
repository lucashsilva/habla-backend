import { Comment } from "../models/comment";
import { getMaskedDistance } from "../util/geo";
import { Profile } from "../models/profile";
import { requireLocationInfo } from "../util/context";
import { getConnection } from "typeorm";
import { Post } from "../models/post";
import { NotificationService } from "../services/notification";
import { NotFoundError } from "../errors/not-found-error";
import { ProfileScoreRecord, ProfileScoreRecordType } from "../models/profile-score-record";

export const CommentTypeDef = `
  type Comment {
    id: ID!
    body: String!
    createdAt: Date!
    distance: String!
    owner: Profile
    post: Post!
    postId: ID!
  }

  input CommentInput {
    body: String!
  }

  extend type Mutation {
    createComment(postId: ID!, comment: CommentInput!, anonymous: Boolean): Comment!
  }
`;

export const CommentResolvers = {
  Mutation: {
    createComment: async(parent, args, context) => {
      requireLocationInfo(context);
      
      let comment = args.comment;

      if (!await Post.count({ id: args.postId })) {
        throw new NotFoundError("Invalid post id.");
      }

      comment.postId = args.postId;

      if (!args.anonymous) {
        comment.ownerUid = context.user.uid;
      }

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      comment.location = location;

      await getConnection().transaction(async transactionalEntityManager => {
        comment = await Comment.create(comment);
        
        await transactionalEntityManager.save(Comment, comment);

        let profileScoreRecord = await ProfileScoreRecord.create({ type: ProfileScoreRecordType.COMMENTED_POST, profileUid: context.user.uid, comment, value: ProfileScoreRecord.POINTS.COMMENTED_POST })
        
        await transactionalEntityManager.save(ProfileScoreRecord, profileScoreRecord);

        await NotificationService.notifyNewComent(comment);
      });

      return comment;
    }
  },
  Comment: {
    distance: (comment: Comment, args, context) => {
      requireLocationInfo(context);

      return getMaskedDistance({ latitude: comment.location.coordinates[0], longitude: comment.location.coordinates[1] }, { latitude: context.location.latitude, longitude: context.location.longitude });
    },
    owner: (comment: Comment) => {
      return comment.ownerUid? Profile.findOne(comment.ownerUid): null;
    },
    post: (comment: Comment) => {
      return Post.findOne(comment.postId);
    }
  }
};