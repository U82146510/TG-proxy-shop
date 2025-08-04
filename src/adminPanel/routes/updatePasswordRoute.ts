import { Router } from "express";
import {update,updateGet} from '../controllers/updatePasswordController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';

export const updateRouter:Router = Router();

updateRouter.get('/update',protectRoute,updateGet);
updateRouter.post('/update',protectRoute,update);