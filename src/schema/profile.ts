import { Profile } from "../models/profile";
import { Post } from "../models/post";
import { IsNull, Equal, MoreThan, Not } from "typeorm";
import * as admin from 'firebase-admin';
import { getPhotoDataWithBufferFromBase64 } from "../util/photo-upload-handler";
import { requireLocationInfo } from "../util/context";
import { ProfileScoreRecord } from "../models/profile-score-record";
import { getConnection } from "typeorm";
import { HablaError } from "../errors/habla-error";
import HablaErrorCodes from "../errors/error-codes";
import { isNull } from "util";

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
    updateProfile(profile: ProfileInput!, photo: Upload, updateHome: Boolean): Profile!
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
    home: [Float]
    score: Int!
    scoreBalance: Int!
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }
`;

export const ProfileResolvers = {
  Query: {
    profile: async (parent, args) => {
      let profile = await Profile.findOne(args.uid);

      if (profile) {
        return profile;
      } else {
        throw new HablaError('No profile with the provided id was found.', HablaErrorCodes.NOT_FOUND_ERROR);
      }
    }
  },
  Profile: {
    posts: async (profile: Profile, args, context) => {
      return await Post.createQueryBuilder()
        .where({owner: profile, deletedAt : IsNull()})
        .orderBy(`"createdAt"`, "DESC")
        .andWhere(`anonymous = false or (anonymous = true and '${profile.uid}' = '${context.user.uid}')`)
        .getMany();
      },
    
    home: (profile: Profile) => {
      return profile.home && profile.home.coordinates;
    },
    score: async (profile: Profile, args, context) => {
      const result = await ProfileScoreRecord.createQueryBuilder("record")
        .select("SUM(value)", "score")
        .where({ profileUid: Equal(context.user.uid), value: MoreThan(0) })
        .getRawOne();

      return result.score || 0;
    },
    scoreBalance: async (profile: Profile, args, context) => {
      const result = await ProfileScoreRecord.createQueryBuilder("record")
        .select("SUM(value)", "scoreBalance")
        .where({ profileUid: Equal(context.user.uid) })
        .getRawOne();

      return result.scoreBalance || 0;
    }
  },
  Mutation: {
    updateProfile: async (parent, args, context) => {
      let photoURL;
      let location;

      if (args.updateHome) {
        requireLocationInfo(context);
        location = context.location ? { type: "Point", coordinates: [context.location.latitude, context.location.longitude] } : null;
      }

      if (await Profile.count({ where: { username: args.profile.username, uid: Not(context.user.uid) }})) {
        throw new HablaError("Username is already taken.", HablaErrorCodes.USERNAME_ALREADY_TAKEN);
      }

      await getConnection().transaction(async transactionalEntityManager => {
        if (args.photo) {
          let photoData = getPhotoDataWithBufferFromBase64(args.photo, `${context.user.uid}-original`);


          let file = admin.storage().bucket().file(`profile-photos/${photoData.fileName}`);

          await file.save(photoData.buffer, {
            metadata: { contentType: photoData.mimeType },
            validation: 'md5'
          });

          photoURL = (await file.getSignedUrl({
            action: 'read',
            expires: '03-09-2491'
          }))[0];

        }
        await transactionalEntityManager.save(Profile, { ...args.profile, uid: context.user.uid, photoURL: photoURL, home: location });
      });
      return Profile.findOne(context.user.uid);
    },
    updateExpoPushToken: async (parent, args, context) => {
      try {
        await Profile.update({ uid: context.user.uid }, { expoPushToken: args.token });
        return true;
      } catch (error) {
        console.log(error);
        throw new HablaError("Error updating expo push token.", HablaErrorCodes.INTERNAL_SERVER_ERROR);
      }
    }
  }
};
