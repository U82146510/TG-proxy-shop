import { type Request,type Response,type NextFunction } from "express";
import {User} from '../../models/User.ts';
import {z} from 'zod';

const schemaUser = z.object({
    userId:z.string()
});

export const users = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const allUsers = await User.find().select('userId balance ');
        if(allUsers.length===0){
            res.status(404).json({message:'Not found'});
        }
        res.status(200).json({message:allUsers});
    } catch (error) {
        next(error)
    }
};

export const user = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaUser.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {userId} = parsed.data;
        const user = await User.findOne({userId:userId}).populate('orders');
        if(!user){
            res.status(404).json({message:'Not found'});
            return;
        }
        res.status(200).json({message:user});
    } catch (error) {
        next(error)
    }
};

const schemaUserUpdate = z.object({
    userId:z.string(),
    balance:z.string()
});

export const updateUser =  async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaUserUpdate.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {userId,balance} = parsed.data;
        const userUpdate = await User.findOneAndUpdate({userId:userId},{
            $set:{
                balance:balance
            }
        },{new:true});
        if(!userUpdate){
            res.status(403).json({message:'Not found'});
            return;
        }
        res.status(200).json({message:`Balance ${balance} for ${userId} was update`});
    } catch (error) {
        next(error)
    }
};