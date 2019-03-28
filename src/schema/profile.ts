import { Profile } from "../models/profile";
import { Post } from "../models/post";
import { IsNull } from "typeorm";
import { InternalServerError } from "../errors/internal-server-error";
import * as admin from 'firebase-admin';
import { getPhotoDataWithBufferFromBase64 } from "../util/photo-upload-handler";

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
  }

  extend type Mutation {
    updateProfile(profile: ProfileInput!, photo: Upload): Profile!
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
    updateProfile: async(parent, args, context) => {
      let photoURL;

      if (args.photo) {
        let photoData = getPhotoDataWithBufferFromBase64(args.photo, `${context.user.uid}-original`);

        try {
          let file = admin.storage().bucket().file(`profile-photos/${photoData.fileName}`);
          
          await file.save(photoData.buffer, { 
            metadata: { contentType: photoData.mimeType },
            validation: 'md5'
          });

          photoURL = (await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          }))[0];
        } catch (error) {
          console.log(JSON.stringify(error));
          throw error;
        }
      }

      return Profile.save({ ...args.profile, uid: context.user.uid, photoURL: photoURL });
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