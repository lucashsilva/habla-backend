import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody, httpDelete } from "inversify-express-utils";
import { Post } from "../models/post";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { ApiPath, ApiOperationGet, SwaggerDefinitionConstant, ApiOperationPost, ApiOperationDelete } from "swagger-express-ts";

@ApiPath({
    path: "/posts",
    name: "Posts"
})
@controller("/posts", AuthorizeMiddleware)
export class PostController extends BaseHttpController {
    @ApiOperationGet({
        description: "Get posts",
        responses: {
            200: { description: "Success", type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "Post" },
            401: { description: "Unauthorized" },
            500: { description: "Internal Server Error" }
        }
    })
    @httpGet("/")
    private async getPosts(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post[]> {
        try {
            let where;

            if (req.query.channelId) {
                where = { channelId: req.query.channelId }
            }
            
            return await Post.find({ where: where, relations: ['owner', 'channel'], order: { 'createdAt': 'DESC' }});
        } catch (error) {
            res.status(500).end();
        }
    }

    @ApiOperationGet({
        path: "/:id",
        description: "Get a specific post",
        parameters: {
           path: {
               "id": { description: "Post id" }
           }
        },
        responses: {
            200: { description: "Success", type: "Post", model: "Post" },
            401: { description: "Unauthorized" }, 
            404: { description: "Not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpGet("/:id")
    private async getOne(@requestParam("id") id: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post> {
        try {
            const post = await Post.findOne(id, { relations: ['owner', 'channel']});

            if (post) {
                return post;
            } else {
                res.status(404).end();
            }
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }

    @ApiOperationPost({
        description: "Create a post",
        parameters: {
            body: {
                model: "Post"
            }
        },
        responses: {
            201: { description: "Created", type: "Post", model: "Post" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpPost("/")
    private async create(@requestBody() post: Post, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Post> {
        try {
            const createdPost = await Post.create({ ...post, owner: { uid: this.httpContext.user.details.uid }}).save();
            res.status(201);

            return createdPost;
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }

    @ApiOperationDelete({
        path: "/:id",
        description: "Delete a post",
        parameters: {
            path: {
              "id": {
                  description: "Post id"
              }   
            }
        },
        responses: {
            201: { description: "Created", type: "Post", model: "Post" },
            401: { description: "Unauthorized" },
            404: { description: 'Not found '},
            500: { description: "Internal Server Error" }
        }
    })
    @httpDelete("/:id")
    private async delete(@requestParam("id") id: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> {
        const post = await Post.findOne(id);

        if (!post) {
            res.status(404).end();
            return;
        } else if (!await this.httpContext.user.isResourceOwner(post)) {
            res.status(403).end();
            return;
        }
        
        try {
            await Post.delete(id);
            res.status(200).end();
        } catch (error) {
            res.status(500).end();
        }
    }
}