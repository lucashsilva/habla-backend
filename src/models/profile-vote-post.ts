import { Entity, BaseEntity, CreateDateColumn, PrimaryColumn, Column, UpdateDateColumn, ManyToOne } from "typeorm";
import { Post } from "./post";
import { Profile } from "./profile";

@Entity()
export class ProfileVotePost extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @PrimaryColumn()
    profileUid: string;

    @ManyToOne(type => Post, post => post.profileVotePosts, { onDelete: 'CASCADE' })
    post: Post;

    @ManyToOne(type => Profile, profile => profile.profileVotePosts, { onDelete: 'CASCADE' })
    profile: Profile;

    @Column({ nullable: false })
    type: "UP" | "DOWN";

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}