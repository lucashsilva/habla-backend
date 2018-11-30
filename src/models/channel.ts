import { Column, Entity, BaseEntity, ManyToOne, CreateDateColumn, UpdateDateColumn, PrimaryGeneratedColumn, OneToMany } from "typeorm";
import { Post } from "./post";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({ name: "Channel" })
@Entity()
export class Channel extends BaseEntity {
    @ApiModelProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiModelProperty({ required: true })
    @Column()
    name: string;

    @OneToMany(type => Post, post => post.channel)
    posts: Post[];

    @ApiModelProperty({ type: "string" })
    @CreateDateColumn({ type: "timestamp with time zone"})
    createdAt: Date;

    @ApiModelProperty({ type: "string" })
    @UpdateDateColumn({ type: "timestamp with time zone"})
    updatedAt: Date;
}