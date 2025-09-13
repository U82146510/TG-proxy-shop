import {incomeStatistics} from '../controllers/monthIncomeController';
import { Router } from 'express';
import {protectRoute} from '../middleware/protectRoute';

export const incomeStatistic:Router = Router();
incomeStatistic.get('/statistics',protectRoute,incomeStatistics);