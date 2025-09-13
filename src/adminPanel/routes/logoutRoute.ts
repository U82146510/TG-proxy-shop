import {logout} from '../controllers/logoutController';
import { Router } from 'express';
import {protectRoute} from '../middleware/protectRoute';

export const logoutRoute:Router = Router();
logoutRoute.get('/logout',protectRoute,logout);