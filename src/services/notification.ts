import { Comment } from "../models/comment";
import { CommentNotificationType, Notification } from "../models/notification";
import { Post } from "../models/post";

export class NotificationService {
    static notifyNewComent = async(comment: Comment) => {
        const post = await Post.findOne(comment.postId);

        if (post.ownerUid !== comment.ownerUid) {
            await Notification.create({ comment: comment, type: CommentNotificationType.COMMENT_ON_OWNED_POST, receiverUid: post.ownerUid }).save();
            // send notification to device
        }
    }
}