import { Router } from "express";
import {login,showLoginForm} from '../controllers/loginController.ts';

export const loginRouter:Router = Router();

loginRouter.get('/login',showLoginForm);
loginRouter.post('/login',login);