import * as express from "express";
import { controller, httpGet, requestParam, BaseHttpController, httpPut, requestBody } from "inversify-express-utils";
import { inject } from "inversify";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { Profile } from "../models/profile";
import { ApiOperationGet, ApiOperationPut, ApiPath } from "swagger-express-ts";

@ApiPath({
    path: "/profiles",
    name: "Profiles"
})
@controller("/profiles", AuthorizeMiddleware)
export class ProfileController extends BaseHttpController {
    @ApiOperationGet({
        path: "/:uid",
        description: "Get a specific user profile",
        parameters: {
           path: {
               "uid": { description: "User id" }
           }
        },
        responses: {
            200: { description: "Success", type: "Profile", model: "Profile" },
            401: { description: "Unauthorized" }, 
            404: { description: "Not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
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

    @ApiOperationPut({
        path: "/:uid",
        description: "Update own user profile",
        parameters: {
           path: {
               "uid": { description: "User id" }
           }
        },
        responses: {
            200: { description: "Success", type: "Post", model: "Post" },
            401: { description: "Unauthorized" }, 
            500: { description: "Internal Server Error" }
        }
    })
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