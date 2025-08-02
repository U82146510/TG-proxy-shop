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
        res.render('dashboard',{users:allUsers})
    } catch (error) {
        next(error)
    }
};


export const userGet = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        res.render('user',{
            error:null,user:null
        });
    } catch (error) {
        next(error)
    }
}

export const user = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaUser.safeParse(req.body);
    try {
        if(!parsed.success){
            res.render('user',{
                user:null,
                error:'Not found'
            });
            return
        }
        const {userId} = parsed.data;
        const user = await User.findOne({userId:userId}).populate('orders');
        if(!user){
            res.render('user',{
                error:'User not found',
                user:null
            })
            return;
        }
        res.render('user',{
            user:user,
            error:null
        });
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
            res.render('update',{
                message:null,
                error:'Wrong input'
            })
            return;
        }
        const {userId,balance} = parsed.data;
        const userUpdate = await User.findOneAndUpdate({userId:userId},{
            $set:{
                balance:balance
            }
        },{new:true});
        if(!userUpdate){
            res.render('update',{
                message:'Not found',
                error:null
            })
            return;
        }
        res.render('update',{
            message:`Balance ${balance} for ${userId} was update`,
            error:null
        })
    } catch (error) {
        next(error)
    }
};