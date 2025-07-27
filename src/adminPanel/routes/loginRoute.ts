import { Router } from "express";
import {login} from '../controllers/loginController.ts';

export const loginRouter:Router = Router();

loginRouter.post('/login',login);