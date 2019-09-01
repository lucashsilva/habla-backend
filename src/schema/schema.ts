import { PostTypeDef, PostResolvers } from "./post";
import { ProfileTypeDef, ProfileResolvers } from "./profile";
import { merge } from 'lodash';
import { CommentTypeDef, CommentResolvers } from "./comment";
import { ChannelTypeDef, ChannelResolvers } from "./channel";
import { ProfileVotePostTypeDef, ProfileVotePostResolvers } from "./profile-vote-post";
import { NotificationTypeDef, NotificationResolvers } from "./notification";
import { ProfileFollowPostTypeDef, ProfileFollowPostResolvers } from "./profile-follow-post"
import { ProfileRevealPostResolvers, ProfileRevealPostTypeDef } from "./profile-reveal-post";

const Query = `
    scalar Date
    
    type Query {
        _empty: String
    }
`;

const Mutation = `
    type Mutation {
        _empty: String
    }
`

const typeDefs = [Query, Mutation, PostTypeDef, ProfileTypeDef, CommentTypeDef, ChannelTypeDef, ProfileVotePostTypeDef, NotificationTypeDef, ProfileFollowPostTypeDef, ProfileRevealPostTypeDef];
const resolvers = merge(PostResolvers, ProfileResolvers, CommentResolvers, ChannelResolvers, ProfileVotePostResolvers, NotificationResolvers, ProfileFollowPostResolvers, ProfileRevealPostResolvers);

export const AppSchema = {
    typeDefs,
    resolvers
};