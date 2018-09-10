import * as express from "express";
import { controller, httpGet, BaseHttpController, requestParam, httpPost, requestBody } from "inversify-express-utils";
import { Channel } from "../models/channel";
import { AuthorizeMiddleware } from "../middlewares/authorize";

@controller("/channels", AuthorizeMiddleware)
export class ChannelController extends BaseHttpController {
    @httpGet("/")
    private async getChannels(req: express.Request, res: express.Response, next: express.NextFunction): Promise<Channel[]> {
        try {
           return await Channel.find();
        } catch (error) {
            res.status(500).end();
        }
    }

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

    @httpPost("/")
    private async create(@requestBody() channel: Channel, req: express.Request, res: express.Response, next: express.NextFunction): Promise<Channel> {
        try {
            return await Channel.create(channel).save();
        } catch (error) {
            console.log(error);
            res.status(500).end();
        }
    }
}