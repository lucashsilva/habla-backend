import { PostTypeDef, PostResolvers } from "./post";
import { ProfileTypeDef, ProfileResolvers } from "./profile";
import { merge } from 'lodash';
import { CommentTypeDef, CommentResolvers } from "./comment";
import { ChannelTypeDef, ChannelResolvers } from "./channel";
import { ProfileVotePostTypeDef, ProfileVotePostResolvers } from "./profile-vote-post";
import { NotificationTypeDef, NotificationResolvers } from "./notification";
<<<<<<< HEAD
import { ProfileFollowPostTypeDef, ProfileFollowPostResolvers} from "./profile-follow-post"
=======
import { ProfileFollowPostTypeDef, ProfileFollowPostResolvers } from "./profile-follow-post"
>>>>>>> 1115265f9186335b77612686fef33e45ba0e90c2

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

const typeDefs = [Query, Mutation, PostTypeDef, ProfileTypeDef, CommentTypeDef, ChannelTypeDef, ProfileVotePostTypeDef, NotificationTypeDef, ProfileFollowPostTypeDef];
const resolvers = merge(PostResolvers, ProfileResolvers, CommentResolvers, ChannelResolvers, ProfileVotePostResolvers, NotificationResolvers, ProfileFollowPostResolvers);

export const AppSchema = {
    typeDefs,
    resolvers
};