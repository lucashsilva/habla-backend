import * as admin from 'firebase-admin';
var serviceAccount = require("/secrets/firebase/service-account.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
});

const getUserFromToken = async(token: string) => {
    try {
        let user = await admin.auth().getUser((await admin.auth().verifyIdToken(token)).uid);
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export {
    getUserFromToken
};