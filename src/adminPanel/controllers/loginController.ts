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

export const showLoginForm = (req: Request, res: Response,next:NextFunction) => {
    res.render('index', { error: null });
};

export const login = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = userSchema.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('index',{
                error:'Invalid input format'
            });
            return;
        }
        const {username,password,} = parsed.data;
        const user = await Auth.findOne({username:username}).select('+password') as IAuth | null;;

        if(!user || !(user instanceof Auth)){
            res.status(404).render('index',{
                error:'User not found'
            });
            return;
        }
        const isMatchPassword = await user.comparePassword(password);
        if(!isMatchPassword){
            await bcrypt.compare(password, DUMMY_HASH);
            res.status(401).render('index',{
                error:'Incorrect password'
            });
            return;
        }

        req.session.userId = user._id.toString()
        res.redirect('/admin/users');
    } catch (error) {
        next(error)
    }
};