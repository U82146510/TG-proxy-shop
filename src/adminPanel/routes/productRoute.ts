import { Router } from "express";
import {createProduct,deleteProduct,updateProduct} from '../controllers/productController.ts';
import {protectRoute} from '../middleware/protectRoute.ts';

export const productRouter:Router = Router();

productRouter.post('/product',protectRoute,createProduct);
productRouter.delete('/product',protectRoute,deleteProduct);
productRouter.patch('/product',protectRoute,updateProduct);