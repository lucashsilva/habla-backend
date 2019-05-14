import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm";

@Entity()
export class PostOthres extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @Column({ default: false })
    follow: boolean;
}