import { Post } from "../models/post";
import { Profile } from "../models/profile";

export class PostDTO {
    id: number;
    body: string;
    ownerUid: string;
    channelId: number;
    createdAt: Date;
    updatedAt: Date;

    distance: "far" | "close" | "very close" | "very far" | "unknown";
    anonymous: boolean;

    owner: Profile;
    
    constructor(source?: Post) {
        if (source) {
            this.id = source.id;
            this.ownerUid = source.ownerUid;
            this.body = source.body;
            this.channelId = source.channelId;
            this.createdAt = source.createdAt;
            this.updatedAt = source.updatedAt;

            this.anonymous = !this.ownerUid;

            this.owner = source.owner;
        }
    }
}