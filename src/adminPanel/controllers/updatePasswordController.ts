import {type Request,type Response,type NextFunction} from 'express';
import {z} from 'zod';
import { Auth,type IAuth } from '../../models/adminPanel.ts';


const userSchema  = z.object({
    username:z.string(),
    password:z.string().min(14)
    .regex(/[A-Z]/)
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});

export const update = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = userSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {username,password,} = parsed.data;
        const user = await Auth.findOne({ username });

        if (!user) {
        res.status(404).json({ message: 'There is no such user' });
        return;
        }

        user.password = password;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({error:'error at update route'});
    }
};