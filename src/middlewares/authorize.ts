import { BaseMiddleware } from "inversify-express-utils";
import * as express from 'express';
import { injectable } from "inversify";

@injectable()
export class AuthorizeMiddleware extends BaseMiddleware {
    handler(req: express.Request, res: express.Response, next: express.NextFunction) {
        if (!this.httpContext.user) {
            res.status(401);
            res.end();
            return;
        }

        next();
    }
}