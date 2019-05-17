import { Entity, BaseEntity, PrimaryColumn } from "typeorm";

@Entity()
export class ProfileFollowPost extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @PrimaryColumn()
    profileUid: string;
}
