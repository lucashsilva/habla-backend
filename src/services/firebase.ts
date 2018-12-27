import * as admin from 'firebase-admin';
import { AuthenticationError } from '../errors/http/authentication-error';
var serviceAccount = require("/secrets/firebase/service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const getUserFromToken = async(token: string) => {
    try {
        let user = {
            uid: (await admin.auth().verifyIdToken(token)).uid
        }
        return user;
    } catch (error) {
        throw new AuthenticationError({ message: 'Invalid token.' });
    }
}

const requireAuthentication = async(req) => {
    if (!req.headers['authorization']) {
        throw new AuthenticationError({ message: `Missing 'Authorization' header.`});
    }

    const user = await getUserFromToken(req.headers['authorization']);

    if (!user) {
        throw new AuthenticationError();
    }

    return user;
}

export {
    getUserFromToken,
    requireAuthentication
};