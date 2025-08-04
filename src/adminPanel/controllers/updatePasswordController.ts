import {type Request,type Response,type NextFunction} from 'express';
import {z} from 'zod';
import { Auth} from '../../models/adminPanel.ts';


const userSchema  = z.object({
    username:z.string(),
    password:z.string().min(14)
    .regex(/[A-Z]/)
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a digit')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
});


export const updateGet = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        res.render('updatepassword',{
            error:null,
            message:null
        })
    } catch (error) {
        next(error);
    }
}

export const update = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = userSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('updatepassword',{
                error:'Invalid input format. Must include 14+ characters with uppercase, lowercase, number, and special character.',
                message:null
            });
            return;
        }
        const {username,password,} = parsed.data;
        const user = await Auth.findOne({ username });

        if (!user) {
        res.status(404).render('updatepassword',{error:null, message: 'There is no such user' });
        return;
        }

        user.password = password;
        await user.save();

        res.status(200).render('updatepassword',{error:null, message: 'Password updated successfully' });
    } catch (error) {
        next(error)
    }
};