import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Channel } from "./channel";
import { Profile } from "./profile";
import { Comment } from "./comment";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({ name: "Post" })
@Entity()
export class Post extends BaseEntity {
    @ApiModelProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false, default: false })
    anonymous: boolean;
    
    @ApiModelProperty({ required: true })
    @Column({ nullable: false })
    body: string;

    // @Column({ nullable: false, type: "point" })
    // location: { x: number, y: number };

    @ManyToOne(type => Channel, channel => channel.posts, { onDelete: "SET NULL" })
    channel: Channel;

    @ManyToOne(type => Profile, profile => profile.posts, { nullable: true })
    owner: Profile;

    @OneToMany(type => Comment, comment => comment.post)
    comments: Comment[];

    @ApiModelProperty({ required : true })
    @Column({ nullable: true })
    ownerUid: string;

    @ApiModelProperty()
    @Column({ nullable: true })
    channelId: number;

    @ApiModelProperty({ type: "string" })
    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @ApiModelProperty({ type: "string" })
    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}