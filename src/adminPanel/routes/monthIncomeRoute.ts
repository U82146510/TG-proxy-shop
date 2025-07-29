import {incomeStatistics} from '../controllers/monthIncomeController.ts';
import { Router } from 'express';
import {protectRoute} from '../middleware/protectRoute.ts';

export const incomeStatistic:Router = Router();
incomeStatistic.get('/statistics',protectRoute,incomeStatistics);