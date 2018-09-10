import { Column, Entity, BaseEntity, Index, OneToMany, PrimaryColumn } from "typeorm";
import { Post } from "./post";

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

    @Column({ nullable: true })
    bio: string;

    @Column({ nullable: true }) 
    website: string;

    @Column({ nullable: true })
    phone: string;
    
    @Column({ type: 'enum', enum: ['MALE', 'FEMALE', 'OTHER'], nullable: true })
    gender: 'MALE' | 'FEMALE' | 'OTHER';

    @OneToMany(type => Post, post => post.owner, { onDelete: 'CASCADE' })
    posts: Post[];
}