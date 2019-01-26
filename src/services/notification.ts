import { Comment } from "../models/comment";
import { CommentNotificationType, Notification } from "../models/notification";
import { Post } from "../models/post";
import Expo, { ExpoPushMessage } from 'expo-server-sdk';
import { Profile } from "../models/profile";

const expo = new Expo();

export class NotificationService {
	static notifyNewComent = async(comment: Comment) => {
		const post = await Post.findOne(comment.postId);

		if (post.ownerUid !== comment.ownerUid) {
			const receiver = await Profile.findOne(post.ownerUid);
			const sender = await Profile.findOne(comment.ownerUid);

			await Notification.create({ comment: comment, type: CommentNotificationType.COMMENT_ON_OWNED_POST, receiverUid: post.ownerUid }).save();
			
			if (receiver.expoPushToken) await NotificationService.sendExpoNotifications({
				body: `${sender.username} commented your post.`,
				data: {
					type: CommentNotificationType.COMMENT_ON_OWNED_POST,
					postId: post.id
				}
			}, [receiver.expoPushToken]);
		}
	}

	private static sendExpoNotifications = async(message: NotificationMessage, tokens: string[]) => {
		let messages = [];

		for (let pushToken of tokens) {
			if (!Expo.isExpoPushToken(pushToken)) {
				console.error(`Push token ${pushToken} is not a valid Expo push token`);
				continue;
			}

			// Construct a message (see https://docs.expo.io/versions/latest/guides/push-notifications.html)
			messages.push({
				...message,
				to: pushToken
			});
		}

		let chunks = expo.chunkPushNotifications(messages);
		let tickets = [];

		// Send the chunks to the Expo push notification service. There are
		// different strategies you could use. A simple one is to send one chunk at a
		// time, which nicely spreads the load out over time:
		for (let chunk of chunks) {
			try {
				let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
				tickets.push(...ticketChunk);
				// NOTE: If a ticket contains an error code in ticket.details.error, you
				// must handle it appropriately. The error codes are listed in the Expo
				// documentation:
				// https://docs.expo.io/versions/latest/guides/push-notifications#response-format
			} catch (error) {
				console.error(error);
			}
		}
	}
}

export declare type NotificationMessage = {
	data?: Object;
	title?: string;
	body?: string;
	sound?: 'default' | null;
	ttl?: number;
	expiration?: number;
	priority?: 'default' | 'normal' | 'high';
	badge?: number;
};