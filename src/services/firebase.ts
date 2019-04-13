import * as admin from 'firebase-admin';
import { AuthenticationError } from '../errors/authentication-error';
var serviceAccount = require("/secrets/firebase/service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://habla-215902.firebaseio.com',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'habla-215902.appspot.com'
});

const getUserFromToken = async(token: string) => {
    try {
        let user = {
            uid: (await admin.auth().verifyIdToken(token)).uid
        }
        
        return user;
    } catch (error) {
        throw new AuthenticationError('Invalid token.');
    }
}

const requireAuthentication = async(req) => {
    if (!req.headers['authorization']) {
        throw new AuthenticationError(`Missing 'Authorization' header.`);
    }

    let user = await getUserFromToken(req.headers['authorization']);

    return user;
}

export {
    getUserFromToken,
    requireAuthentication
};