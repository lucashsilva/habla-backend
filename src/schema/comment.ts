import { Comment } from "../models/comment";
import { getMaskedDistance } from "../util/geo";
import { Profile } from "../models/profile";
import { requireLocationInfo } from "../util/context";
import { getConnection } from "typeorm";
import { Notification, NotificationType } from "../models/notification";
import { Post } from "../models/post";

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
      let post = await Post.findOne(args.postId);

      comment.post = post;

      if (!args.anonymous) {
        comment.ownerUid = context.user.uid;
      }

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      comment.location = location;

      await getConnection().transaction(async() => {
        comment = await Comment.create(comment).save();

        if (post.ownerUid !== context.user.uid) await Notification.create({ comment: comment, type: NotificationType.COMMENT_ON_OWNED_POST, receiverUid: post.ownerUid }).save();
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