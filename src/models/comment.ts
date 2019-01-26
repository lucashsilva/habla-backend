import { Entity, BaseEntity, CreateDateColumn, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, Index, OneToMany } from "typeorm";
import { Profile } from "./profile";
import { Post } from "./post";
import { Notification } from "./notification";

@Entity()
export class Comment extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    body: string;

    @ManyToOne(type => Profile, { onDelete: 'CASCADE' })
    owner: Profile;

    @Column({ nullable: true })
    ownerUid: string;

    @ManyToOne(type => Post, { onDelete: 'CASCADE' })
    post: Post;

    @Column({ nullable: false })
    postId: number;

    @Column("geometry", {
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: false
    })
    @Index({ spatial: true })
    location: any;

    @OneToMany(type => Notification, notification => notification.comment)
    notifications: Notification[];

    @CreateDateColumn({ type: "timestamp with time zone" })
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updatedAt: Date;
}