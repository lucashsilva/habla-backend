import { Entity, BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Profile } from "./profile";
import { Post } from "./post";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    body: string;

    @ManyToOne(type => Profile)
    owner: Profile;

    @ManyToOne(type => Post)
    post: Post;

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @CreateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}