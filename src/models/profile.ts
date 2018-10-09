import { Column, Entity, BaseEntity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Post } from "./post";
import { ApiModel, ApiModelProperty } from "swagger-express-ts";

@ApiModel({
    name: "Profile"
})
@Entity()
export class Profile extends BaseEntity {
    @ApiModelProperty({
        description: "User id" ,
        required: true
    })
    @PrimaryColumn()
    @Index({ unique: true })
    uid: string;

    @ApiModelProperty({
        description: "Username" ,
        required: true
    })
    @Column()
    @Index({ unique: true })
    username: string;

    @ApiModelProperty({
        description: "Name",
        required: true
    })
    @Column()
    name: string;

    @ApiModelProperty({
        description: "Bio",
        required: false
    })
    @Column({ nullable: true })
    bio: string;

    @ApiModelProperty({
        description: "Website",
        required: false
    })
    @Column({ nullable: true }) 
    website: string;

    @ApiModelProperty({
        description: "Phone",
        required: false
    })
    @Column({ nullable: true })
    phone: string;
    
    @ApiModelProperty({
        description: "Gender",
        required: false
    })
    @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true })
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    @OneToMany(type => Post, post => post.owner, { onDelete: 'CASCADE' })
    posts: Post[];
}