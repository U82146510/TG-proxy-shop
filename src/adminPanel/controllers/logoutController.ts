import {type Request,type Response,type NextFunction} from 'express'

export const logout = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        req.session.destroy((error:unknown)=>{
            if(error){
                next(error);
                return;
            }
            res.clearCookie('admin.sid');
            res.redirect('/auth/login');
        })
    } catch (error) {
        next(error);
    }
};