import { Notification } from "../models/notification";
import { Post } from "../models/post";
import { Comment } from "../models/comment";

export const NotificationTypeDef = `
  extend type Query {
    notifications: [Notification!]!
  }

  extend type Mutation {
    setNotificationsAsRead(notificationIds: [ID!]!): Boolean!
  }

  type Notification {
    id: ID!
    type: NotificationType!
    read: Boolean!
    comment: Comment
    createdAt: Date!
  }

  enum NotificationType {
    COMMENT_ON_OWNED_POST
  }
`;

export const NotificationResolvers = {
  Query: {
    notifications: async(parent, args, context) => {
      return await Notification.find({ where: { receiverUid: context.user.uid }, order: { createdAt: 'DESC' }});
    }
  },
  Notification: {
    comment: async(notification: Notification) => {
      return await Comment.findOne(notification.commentId);
    },
    read: (notification: Notification) => {
      return !!notification.readAt;
    }
  },
  Mutation: {
    setNotificationsAsRead: async(parent, args, context) => {
      throw new Error("not yet implemented");
    }
  }
};