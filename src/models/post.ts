import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Channel } from "./channel";
import { Profile } from "./profile";
import { Comment } from "./comment";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    name: "Post"
})
@Entity()
export class Post extends BaseEntity {
    @ApiModelProperty({
        description: "Post id" ,
        required: true
    })
    @PrimaryGeneratedColumn()
    id: number;
    
    @ApiModelProperty({
        description : "Post body",
        required : true
    })
    @Column({ nullable: false })
    body: string;

    // @Column({ nullable: false, type: "point" })
    // location: { x: number, y: number };

    @ManyToOne(type => Channel, channel => channel.posts, { onDelete: "SET NULL" })
    channel: Channel;

    @ManyToOne(type => Profile, profile => profile.posts)
    owner: Profile;

    @OneToMany(type => Comment, comment => comment.post)
    comments: Comment[];

    @ApiModelProperty({
        description : "Post owner profile id",
        required : true
    })
    @Column({ nullable: true })
    ownerUid: string;

    @ApiModelProperty({
        description: "Post channel id",
        required: false
    })
    @Column({ nullable: true })
    channelId: number;

    @ApiModelProperty({
        description: "Creation date",
        required: false,
        type: 'Date'
    })
    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @ApiModelProperty({
        description: "Update date",
        required: false,
        type: 'Date'
    })
    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}