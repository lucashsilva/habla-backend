import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, Index, ManyToMany, JoinTable } from "typeorm";
import { Channel } from "./channel";
import { Profile } from "./profile";
import { Comment } from "./comment";
import { ProfileVotePost } from "./profile-vote-post";
import { Notification } from "./notification";
import { ProfileFollowPost } from "./profile-follow-post";


@Entity()
export class Post extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column({ nullable: false })
    body: string;

    @Column({ default: false })
    anonymous: Boolean;

    @Column("geometry", {
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: false
    })
    @Index({ spatial: true })
    location: any;

    @ManyToMany(type => Channel, { cascade: ['insert'] })
    @JoinTable({ name: 'post_map_channel' })
    channels: Channel[];

    @ManyToOne(type => Profile, profile => profile.posts, { nullable: true, onDelete: 'CASCADE' })
    owner: Profile;

    @OneToMany(type => Comment, comment => comment.post)
    comments: Comment[];

    @OneToMany(type => ProfileVotePost, pvp => pvp.post)
    profileVotePosts: ProfileVotePost[];

    @OneToMany(type => Notification, notification => notification.post)
    notifications: Notification[];

    @Column({ nullable: false })
    ownerUid: string;

    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;

    @Column({ type: "timestamp with time zone", nullable: true })
    deletedAt: Date;

    @Column({ nullable: true })
    photoURL: string;

    @ManyToMany(type => Profile, { cascade: ['insert'] })
    @JoinTable({ name: 'profile_follow_post' })
    postFollowers: Profile[];
}