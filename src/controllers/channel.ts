import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody } from "inversify-express-utils";
import { Channel } from "../models/channel";
import { AuthorizeMiddleware } from "../middlewares/authorize";
import { ApiPath, ApiOperationGet, SwaggerDefinitionConstant, ApiOperationPost } from "swagger-express-ts";

@ApiPath({ path: "/channels", name: "Channels" })
@controller("/channels", AuthorizeMiddleware)
export class ChannelController extends BaseHttpController {
    @ApiOperationGet({
        description: "Get channels",
        responses: {
            200: { description: "Success", type: SwaggerDefinitionConstant.Response.Type.ARRAY, model: "Channel" },
            401: { description: "Unauthorized" },
            500: { description: "Internal Server Error" }
        }
    })
    @httpGet("/")
    private async getChannels(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Channel[]> {
        try {
           return await Channel.find();
        } catch (error) {
            res.status(500).end();
        }
    }

    @ApiOperationGet({
        path: "/:id",
        description: "Get a specific channel",
        parameters: {
           path: {
               "id": { description: "Channel id" }
           }
        },
        responses: {
            200: { description: "Success", type: "Channel", model: "Channel" },
            401: { description: "Unauthorized" }, 
            404: { description: "Not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpGet("/:id")
    private async getOne(@requestParam("id") id: number, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Channel> {
        try {
            const channel = await Channel.findOne(id);

            if (channel) {
                return channel;
            } else {
                res.status(404).end();
            }
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }

    @ApiOperationPost({
        description: "Create a channel",
        parameters: {
            body: {
                model: "Channel"
            }
        },
        responses: {
            201: { description: "Created", type: "Channel", model: "Channel" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" }, 
            500: { description: "Internal Server Error" }
        }
    })
    @httpPost("/")
    private async create(@requestBody() channel: Channel, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Channel> {
        try {
            const createdChannel = await Channel.create(channel).save();
            res.status(201);

            return createdChannel;
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }
}