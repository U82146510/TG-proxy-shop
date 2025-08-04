import { Router } from "express";
import {createProduct,deleteProduct,updateProduct,productGet} from '../controllers/productController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';

export const productRouter:Router = Router();

productRouter.get('/product',protectRoute,productGet);
productRouter.post('/product',protectRoute,createProduct);
productRouter.delete('/product',protectRoute,deleteProduct);
productRouter.patch('/product',protectRoute,updateProduct);