import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany, Index } from "typeorm";
import { Channel } from "./channel";
import { Profile } from "./profile";
import { Comment } from "./comment";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";
import { ProfileVotePost } from "./profile-vote-post";

@ApiModel({ name: "Post" })
@Entity()
export class Post extends BaseEntity {
    @ApiModelProperty()
    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiModelProperty({ required: true })
    @Column({ nullable: false })
    body: string;

    @Column("geometry", {
        spatialFeatureType: "Point",
        srid: 4326,
        nullable: false
    })
    @Index({ spatial: true })
    location: any;

    @ManyToOne(type => Channel, channel => channel.posts, { onDelete: "SET NULL" })
    channel: Channel;

    @Column({ nullable: true })
    channelId: number;

    @ManyToOne(type => Profile, profile => profile.posts, { nullable: true })
    owner: Profile;

    @OneToMany(type => Comment, comment => comment.post, { onDelete: 'CASCADE' })
    comments: Comment[];

    @OneToMany(type => ProfileVotePost, pvp => pvp.post)
    profileVotePosts: ProfileVotePost[];

    @ApiModelProperty({ required: false })
    @Column({ nullable: true })
    ownerUid: string;

    @ApiModelProperty({ type: "string" })
    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @ApiModelProperty({ type: "string" })
    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;

    @Column({ type: "timestamp with time zone", nullable: true })
    deletedAt: Date;
}