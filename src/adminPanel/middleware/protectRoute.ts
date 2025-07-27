import {type Request,type Response,type NextFunction} from 'express';

export const protectRoute = (req:Request,res:Response,next:NextFunction)=>{
    try {
        if(!req.session||!req.session.userId){
            res.status(401).json({message:'Unauthorized: Please login first.'})
            return;
        }
        next()
    } catch (error) {
        next(error);
    }
};