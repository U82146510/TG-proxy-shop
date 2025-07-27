import { Router } from "express";
import {update} from '../controllers/updatePasswordController.ts';

export const updateRouter:Router = Router();

updateRouter.post('/update',update);