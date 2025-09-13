import { Router } from "express";
import {login,showLoginForm} from '../controllers/loginController';

export const loginRouter:Router = Router();

loginRouter.get('/login',showLoginForm);
loginRouter.post('/login',login);