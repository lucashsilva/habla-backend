import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class PostOthres extends BaseEntity {
    @PrimaryGeneratedColumn()
    postId: number;

    @Column({ default: false })
    follow: boolean;
}