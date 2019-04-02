import { Profile } from "../models/profile";
import { Post } from "../models/post";
import { IsNull } from "typeorm";
import { InternalServerError } from "../errors/internal-server-error";
import { NotFoundError } from "../errors/not-found-error";

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
    profile: async(parent, args) => {
      let profile = await Profile.findOne(args.uid);

      if (profile) {
        return profile;
      } else {
        throw new NotFoundError('Profile not found.');
      }
    }
  },
  Profile: {
    posts: (profile: Profile) => {
      return Post.find({ where: { owner: profile, deletedAt: IsNull()}});
    }
  },
  Mutation: {
    updateProfile: async(parent, args, context) => {
      await Profile.save({ ...args.profile, uid: context.user.uid });

      return Profile.findOne(context.user.uid);
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