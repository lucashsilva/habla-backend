import { Column, Entity, BaseEntity, Index, OneToMany, PrimaryColumn, ManyToMany, JoinTable } from "typeorm";
import { Post } from "./post";
import { ProfileVotePost } from "./profile-vote-post";
import { Notification } from "./notification";
import { ProfileFollowPost } from "./profile-follow-post";

@Entity()
export class Profile extends BaseEntity {
    @PrimaryColumn()
    @Index({ unique: true })
    uid: string;

    @Column()
    @Index({ unique: true })
    username: string;

    @Column()
    name: string;

    @Column("geometry", {
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: true
    })
    @Index({ spatial: true })
    home: any;

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true }) 
    website: string;

    @Column({ nullable: true })
    phone: string;
    
    @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true })
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    @Column({ nullable: true })
    photoURL: string;

    @Column({ nullable: true })
    expoPushToken: string;

    @OneToMany(type => Post, post => post.owner)
    posts: Post[];

    @OneToMany(type => ProfileVotePost, pvp => pvp.profile)
    profileVotePosts: ProfileVotePost[];

    @OneToMany(type => Notification, notification => notification.receiver, { onDelete: 'CASCADE' })
    notifications: Notification[];
}