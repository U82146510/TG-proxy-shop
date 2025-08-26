import { type Request,type Response,type NextFunction } from "express";
import {z} from 'zod';

const sendMessageSchema = z.object({
    message:z.string()
});

export const sendmessageGet = (req:Request,res:Response,next:NextFunction)=>{
    try {
        res.render('sendmessagestousers');
    } catch (error) {
        next(error)
    }
};
export const sendmessagePost = (req:Request,res:Response,next:NextFunction)=>{
    const parsed = sendMessageSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('sendmessagestousers',{
                
            })
        }
        
    } catch (error) {
        next(error)
    }
};