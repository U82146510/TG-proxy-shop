import { Router } from "express";
import {sendmessageGet,sendmessagePost} from '../controllers/sendMessageController.ts';
import { protectRoute } from "../middleware/protectRoute.ts";

export const sendMsgRoute:Router = Router();

sendMsgRoute.get('/sendmessage',protectRoute,sendmessageGet);
sendMsgRoute.post('/sendmessage',protectRoute,sendmessagePost);