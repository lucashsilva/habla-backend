import { Entity, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class PostMapChannel extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @PrimaryColumn()
    channelId: number;
}