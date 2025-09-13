import { Router } from "express";
import {sendmessageGet,sendmessagePost} from '../controllers/sendMessageController';
import { protectRoute } from "../middleware/protectRoute";

export const sendMsgRoute:Router = Router();

sendMsgRoute.get('/sendmessage',protectRoute,sendmessageGet);
sendMsgRoute.post('/sendmessage',protectRoute,sendmessagePost);