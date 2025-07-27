import { Router } from "express";
import {users,user,updateUser} from '../controllers/userController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';


export const userRouter:Router = Router();

userRouter.get('/users',protectRoute,users);
userRouter.post('/user',protectRoute,user);
userRouter.patch('/user',protectRoute,updateUser);