import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Post } from "./post";

@Entity()
export class Channel extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @OneToMany(type => Post, post => post.channel)
    posts: Post[];

    // @Column({ nullable: false, type: "point" })
    // location: { x: number, y: number };

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @CreateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}