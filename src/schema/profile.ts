import { Profile } from "../models/profile";
import { Post } from "../models/post";

export const ProfileTypeDef = `
  extend type Query {
    profile(uid: ID!): Profile
  }

  type Profile {
    uid: ID!
    name: String!
    username: String!
    bio: String
    website: String
    phone: String
    gender: Gender
    posts: [Post!]!
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }
`;

export const ProfileResolvers = {
  Query: {
    profile: async(parent, args) => {
      return await Profile.findOne(args.uid);
    }
  },
  Profile: {
    posts: async(profile: Profile) => {
      return await Post.find({ owner: profile });
    }
  }
};