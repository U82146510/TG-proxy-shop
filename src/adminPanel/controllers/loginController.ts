import {type Request,type Response,type NextFunction} from 'express';
import {z} from 'zod';
import { Auth,type IAuth } from '../../models/adminPanel.ts';
import bcrypt from 'bcryptjs';

const DUMMY_HASH = '$2a$12$C6UzMDM.H6dfI/f/IKcEeO5KfUdiW.SiV3X2XnFk4Ltp0jJX61ZxW';

const userSchema  = z.object({
    username:z.string(),
    password:z.string().min(14)
    .regex(/[A-Z]/)
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export const login = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = userSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {username,password,} = parsed.data;
        const user = await Auth.findOne({username:username}).select('+password') as IAuth | null;;

        if(!user || !(user instanceof Auth)){
            res.status(404).json({message:'There no such a user'});
            return;
        }
        const isMatchPassword = await user.comparePassword(password);
        if(!isMatchPassword){
            await bcrypt.compare(password, DUMMY_HASH);
            res.status(401).json({message:'Incorrect password'});
            return;
        }

        req.session.userId = user._id.toString()
        res.status(200).json({message:'successfully logged in'});
    } catch (error) {
        next(error)
    }
};