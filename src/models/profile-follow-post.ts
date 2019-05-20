import { Entity, BaseEntity, PrimaryColumn, ManyToOne } from "typeorm";
import { Profile } from "./profile";

@Entity()
export class ProfileFollowPost extends BaseEntity {
    @PrimaryColumn()
    postId: number;

    @PrimaryColumn()
    profileUid: string;

    @ManyToOne(type => Profile)
    profile: Profile;
}
