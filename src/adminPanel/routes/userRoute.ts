import { Router } from "express";
import {users,user,userGet,updateUser,updateUserGet} from '../controllers/userController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';


export const userRouter:Router = Router();

userRouter.get('/users',protectRoute,users);

userRouter.post('/user',protectRoute,user);
userRouter.get('/user',protectRoute,userGet);

userRouter.get('/userupdate',protectRoute,updateUserGet)
userRouter.patch('/userupdate',protectRoute,updateUser);