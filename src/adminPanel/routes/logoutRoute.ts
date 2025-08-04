import {logout} from '../controllers/logoutController.ts';
import { Router } from 'express';
import {protectRoute} from '../middleware/protectRoute.ts';

export const logoutRoute:Router = Router();
logoutRoute.get('/logout',protectRoute,logout);