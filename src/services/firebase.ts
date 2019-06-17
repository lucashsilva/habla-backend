import * as admin from 'firebase-admin';
import HablaErrorCodes from '../errors/error-codes';
import { HablaError } from '../errors/habla-error';
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
        throw new HablaError('Invalid token.', HablaErrorCodes.AUTHENTICATION_ERROR);
    }
}

const requireAuthentication = async(req) => {
    if (!req.headers['authorization']) {
        throw new HablaError(`Missing 'Authorization' header.`, HablaErrorCodes.AUTHENTICATION_ERROR);
    }

    let user = await getUserFromToken(req.headers['authorization']);

    return user;
}

export {
    getUserFromToken,
    requireAuthentication
};