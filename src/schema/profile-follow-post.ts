import { ProfileFollowPost } from "../models/profile-follow-post";
import { getConnection } from "typeorm";

export const ProfileFollowPostTypeDef = `

  type ProfileFollowPost {
    postId: Int!
    profileUid: String!
  }
`

export const ProfileFollowPostResolvers = {
}