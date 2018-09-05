import * as express from "express";
import { controller, httpGet, BaseHttpController } from "inversify-express-utils";

@controller("/posts")
export class PostController extends BaseHttpController {
    @httpGet("/")
    private async getPosts(req: express.Request, res: express.Response, next: express.NextFunction): Promise<any[]> {
        try {
           return [];
        } catch (exception) {
            // handle
        }
    }
}