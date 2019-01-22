import { Column, Entity, BaseEntity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Post } from "./post";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { ProfileVotePost } from "./profile-vote-post";
import { Notification } from "./notification";

@ApiModel({ name: "Profile" })
@Entity()
export class Profile extends BaseEntity {
    @ApiModelProperty()
    @PrimaryColumn()
    @Index({ unique: true })
    uid: string;

    @ApiModelProperty({ required: true })
    @Column()
    @Index({ unique: true })
    username: string;

    @ApiModelProperty({ required: true })
    @Column()
    name: string;

    @ApiModelProperty()
    @Column({ nullable: true })
    bio: string;

    @ApiModelProperty()
    @Column({ nullable: true }) 
    website: string;

    @ApiModelProperty()
    @Column({ nullable: true })
    phone: string;
    
    @ApiModelProperty()
    @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true })
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    @Column({ nullable: true })
    photoURL: string;

    @OneToMany(type => Post, post => post.owner, { onDelete: 'CASCADE' })
    posts: Post[];

    @OneToMany(type => ProfileVotePost, pvp => pvp.profile)
    profileVotePosts: ProfileVotePost[];

    @OneToMany(type => Notification, notification => notification.receiver)
    notifications: Notification[];
}