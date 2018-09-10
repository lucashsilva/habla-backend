import * as express from "express";
import { controller, httpGet, requestParam, BaseHttpController, httpPut, requestBody } from "inversify-express-utils";
import { inject } from "inversify";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { Profile } from "../models/profile";

@controller("/profiles", AuthorizeMiddleware)
export class ProfileController extends BaseHttpController {
    @httpGet("/:uid")
    private async findOne(@requestParam("uid") uid: string, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Profile> {
        try {
            if (uid === "self" && this.httpContext.user) uid = this.httpContext.user.details.uid;

            const profile = await Profile.findOne(uid);
            
            if (profile) {
                return profile;
            } else {
                res.status(404).end();
            }
        } catch (exception) {
            console.log(exception);
            res.status(500).end();
        }
    }

    @httpPut("/:uid")
    private async updateProfile(@requestParam("uid") uid: string, @requestBody() profile: Profile, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Profile> {
        try {
            if (uid === "self") {
                profile.uid = this.httpContext.user.details.uid;
            } else {
                res.status(401).end();
            }

            return await Profile.save(profile);
        } catch (exception) {
            console.log(exception);
            res.status(500).end();
        }
    }
}