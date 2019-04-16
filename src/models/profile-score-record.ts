import { Entity, BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Post } from "./post";
import { Comment } from "./comment";

@Entity()
export class ProfileScoreRecord extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    profileUid: string;

    @Column()
    value: number;

    @Column()
    type: 'CREATED_PUBLIC_POST' | 'CREATED_ANONYMOUS_POST' | 'COMMENTED_POST';

    @Column({ nullable: true })
    commentId: number;

    @ManyToOne(type => Comment, { onDelete: 'CASCADE' })
    comment: Comment;

    @Column({ nullable: true })
    postId: number;

    @ManyToOne(type => Post, { onDelete: 'CASCADE' })
    post: Post;

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    static POINTS: {
        CREATED_PUBLIC_POST: 2,
        CREATED_ANONYMOUS_POST: -10,
        COMMENTED_POST: 1
    }
}