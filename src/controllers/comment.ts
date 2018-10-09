import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody, httpDelete } from "inversify-express-utils";
import { Post } from "../models/post";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { Comment } from "../models/comment";
import { ApiPath, ApiOperationGet, ApiOperationPost, SwaggerDefinitionConstant } from "swagger-express-ts";

@ApiPath({
    path: "/posts/:postId/comments",
    name: "Post comments"
})
@controller("/posts/:postId/comments", AuthorizeMiddleware)
export class CommentController extends BaseHttpController {
    @ApiOperationGet({
        parameters: {
            path: {
                "postId": { description: "Post id" }
            }
        },
        description: "Get comments for a specific post",
        responses: {
            200: { description: "Success", type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "Comment" },
            401: { description: "Unauthorized" }, 
            404: { description: "Post not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpGet("/")
    private async getComments(@requestParam('postId') postId: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Comment[]> {
        try {
            if (!await Post.count({ where: { id: postId }})) {
                res.status(404).end();
                return;
            }

            return Comment.find({ where: { post: { id: postId } }, relations: ['owner'], order: { 'createdAt': 'DESC' }});
        } catch (error) {
            res.status(500).end();
        }
    }

    @ApiOperationPost({
        description: "Post a comment for a specific post",
        parameters: {
            path: {
                "postId": {
                    description: "Post id"
                }
            }
        },
        responses: {
            201: { description: "Created", type: "Comment", model: "Comment" },
            401: { description: "Unauthorized" }, 
            404: { description: "Post not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpPost("/")
    private async postComment(@requestParam('postId') postId: number, @requestBody() comment: Comment, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Comment> {
        try {
            if(!await Post.count({ where: { id: postId }})) {
                res.status(404).end();
                return;
            }

            const createdComment = await Comment.create({ ...comment, owner: { uid: this.httpContext.user.details.uid }, post: { id: postId }}).save();

            res.status(201);
            return createdComment;
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }
}