import { Router } from "express";
import {users,user,userGet,updateUser} from '../controllers/userController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';


export const userRouter:Router = Router();

userRouter.get('/users',users);
userRouter.post('/user',user);
userRouter.get('/user',userGet);
userRouter.patch('/user',updateUser);