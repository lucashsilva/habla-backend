import { Entity, BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn } from "typeorm";
import { Profile } from "./profile";
import { Comment } from "./comment";

@Entity()
export class Notification extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    type: NotificationType;

    @Column()
    commentId: number;

    @ManyToOne(type => Comment, comment => comment.notifications)
    comment: Comment;

    @Column({ nullable: false })
    receiverUid: string;

    @ManyToOne(type => Profile, profile => profile.notifications)
    receiver: Profile;

    @Column({ type: "timestamp with time zone", nullable: true })
    readAt: Date;

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt: Date;
}

export enum NotificationType {
    COMMENT_ON_OWNED_POST = 'COMMENT_ON_OWNED_POST'
}