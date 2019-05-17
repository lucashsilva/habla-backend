import { Entity, BaseEntity, PrimaryColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Post } from "./post";
import { Profile } from "./profile";

@Entity()
export class ProfileFollowPost extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @PrimaryColumn()
    profileUid: string;
}