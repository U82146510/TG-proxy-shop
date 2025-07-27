import { Router } from "express";
import {update} from '../controllers/updatePasswordController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';

export const updateRouter:Router = Router();

updateRouter.post('/update',protectRoute,update);