import { Comment } from "../models/comment";
import { getMaskedDistance } from "../util/geo";
import { Profile } from "../models/profile";
import { requireLocationInfo } from "../util/context";

export const CommentTypeDef = `
  type Comment {
    id: ID!
    body: String!
    createdAt: Date!
    distance: String!
    owner: Profile
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
      
      const comment = args.comment;

      comment.postId = args.postId;

      if (!args.anonymous) {
        comment.ownerUid = context.user.uid;
      }

      const location = context.location? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] }: null;
      comment.location = location;
  
      return await Comment.create(comment).save();
    }
  },
  Comment: {
    distance: (comment: Comment, args, context) => {
      requireLocationInfo(context);

      return getMaskedDistance({ latitude: comment.location.coordinates[0], longitude: comment.location.coordinates[1] }, { latitude: context.location.latitude, longitude: context.location.longitude });
    },
    owner: async(comment: Comment) => {
      return comment.ownerUid? await Profile.findOne(comment.ownerUid): null;
    }
  }
};