import * as admin from 'firebase-admin';
import { injectable } from 'inversify';
var serviceAccount = require("../../service-account.json");

@injectable()
export class AuthenticationService {
    constructor() {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            databaseURL: "https://habla-215902.firebaseio.com"
        });

        console.log("Authentication provider is ready.");
    }

    async getUserFromToken(token: string) {
        let user = await admin.auth().getUser((await admin.auth().verifyIdToken(token)).uid);
        return user;
    }
}