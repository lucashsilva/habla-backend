import { Profile } from "../models/profile";
import { Post } from "../models/post";
import { IsNull } from "typeorm";
import { InternalServerError } from "../errors/internal-server-error";

export const ProfileTypeDef = `
  extend type Query {
    profile(uid: ID!): Profile
  }

  input ProfileInput {
    name: String!
    username: String!
    bio: String
    website: String
    phone: String
    gender: Gender
    photoURL: String
  }

  extend type Mutation {
    updateProfile(profile: ProfileInput!): Profile!
    updateExpoPushToken(token: String): Boolean!
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
    photoURL: String
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }
`;

export const ProfileResolvers = {
  Query: {
    profile: (parent, args) => {
      return Profile.findOne(args.uid);
    }
  },
  Profile: {
    posts: (profile: Profile) => {
      return Post.find({ where: { owner: profile, deletedAt: IsNull()}});
    }
  },
  Mutation: {
    updateProfile: (parent, args, context) => {
      return Profile.save({ ...args.profile, uid: context.user.uid });
    },
    updateExpoPushToken: async(parent, args, context) => {
      try {
        await Profile.update({ uid: context.user.uid }, { expoPushToken: args.token });
      } catch (error) {
        console.log(error);
        throw new InternalServerError("Error updating expo push token.");
      }

      return true;
    }
  }
};