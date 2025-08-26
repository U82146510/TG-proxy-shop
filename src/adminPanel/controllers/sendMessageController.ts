import { type Request,type Response,type NextFunction } from "express";
import {z} from 'zod';
import { User } from "../../models/User.ts";
import {sendMsg} from '../utils/sendMessage.ts';
import {bot} from '../../bot/bot.ts';

const sendMessageSchema = z.object({
    message:z.string()
});

export const sendmessageGet = (req:Request,res:Response,next:NextFunction):void=>{
    try {
        res.render('sendmessagestousers',{
            error:null,
            message:null
        });
    } catch (error) {
        next(error)
    }
};

export const sendmessagePost = async (req:Request,res:Response,next:NextFunction):Promise<void>=>{
    const parsed = sendMessageSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('sendmessagestousers',{
                error:'Incorrect data',
                message:null
            });
            return;
        }
        const {message} = parsed.data;
        const allUsers = await User.find().select('userId');
        if(allUsers.length===0){
            return;
        }
        const failed: string[] = [];
        for(const arg of allUsers){
           const err =  await sendMsg(bot,arg.userId,message);
           if(err){
             failed.push(arg.userId)
           }
        }

        res.status(201).render('sendmessagestousers',{
            error: failed.length ? `Failed for users: ${failed.join(', ')}` : null,
            message: failed.length ? null : 'Message sent to all users'
        });
    } catch (error) {
        next(error)
    }
};