import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody, httpDelete } from "inversify-express-utils";
import { Post } from "../models/post";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { Comment } from "../models/comment";

@controller("/posts/:postId/comments", AuthorizeMiddleware)
export class CommentController extends BaseHttpController {
    @httpGet("/")
    private async getComments(@requestParam('postId') postId: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Comment[]> {
        try {
            return Comment.find({ where: { post: { id: postId } }, relations: ['owner'], order: { 'createdAt': 'DESC' }});
        } catch (error) {
            res.status(500).end();
        }
    }

    @httpPost("/")
    private async postComment(@requestParam('postId') postId: number, @requestBody() comment: Comment, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Comment> {
        try {
            return await Comment.create({ ...comment, owner: { uid: this.httpContext.user.details.uid }, post: { id: postId }}).save();
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }
}