import ApolloClient from "apollo-boost";
import * as firebase from 'firebase';

export const client = new ApolloClient({
    uri: process.env.GRAPHQL_URL || 'http://habla.online/graphql',
    request: async operation => {
        let token = await firebase.auth().currentUser.getIdToken();

        operation.setContext({
            headers: {
                authorization: token,
                latitude: operation.getContext().location? operation.getContext().location.latitude: null,
                longitude: operation.getContext().location? operation.getContext().location.longitude: null
            }
        });
    }
});