//imports

export const ProfileFollowPostTypeDef = `

  extend type Query {
    posts(radius: Float, profileUid: ID, limit: Int, ignoreIds: [ID!]): [Post!]!
    //algo
  }

  type ProfileFollowPost {
    post: Post!
    profile: Profile!
    type: ProfileFollowPost
  }

  input ProfileFollowPost {
      follow: Boolean!
  }

`;

export const ProfileFollowPostResolvers = `

`;