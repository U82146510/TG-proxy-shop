import { Router } from "express";
import {createProduct,deleteProduct,updateProduct,productGet} from '../controllers/productController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';

export const productRouter:Router = Router();

productRouter.get('/product',productGet);
productRouter.post('/product',createProduct);
productRouter.delete('/product',deleteProduct);
productRouter.patch('/product',updateProduct);