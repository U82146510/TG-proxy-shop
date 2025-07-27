import { type Request,type Response,type NextFunction } from "express";
import {Product} from '../../models/Products.ts';
import {z} from 'zod';

const schemaProduct = z.object({
    country:z.string(),
    isp:z.string(),
    period:z.string(),
    price:z.number(),
})

export const createProduct = async (req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
         if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {country,isp,period,price} = parsed.data;
        const createProduct = await Product.create({
            country:country,
            isp:isp,
            period:period,
            price:price
        });
        res.status(201).json({message:`Pruduct ${createProduct.country} created`})
    } catch (error) {
        next(error)
    }
};



export const deleteProduct = async (req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {country,isp,period,price} = parsed.data;
        const deleteProduct = await Product.findOneAndDelete({country,isp,period,price});
        if (!deleteProduct) {
             return res.status(404).json({ error: 'Product not found' });
        }
        res.status(200).json({message:`Product ${deleteProduct?.country} deleted`});
    } catch (error) {
        next(error)
    }
};



export const updateProduct = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).json({error:'Wrong input'});
            return;
        }
        const {country,isp,period,price} = parsed.data;
        const updateProduct = await Product.findOneAndUpdate({
            country:country,
            isp:isp,
            period
        },{
            $set:{
                price:price
            }
        },{new:true});
        if (!updateProduct) {
             return res.status(404).json({ error: 'Product not found' });
        }

        res.status(200).json({message:`Product ${updateProduct.country} updated`})
    } catch (error) {
        next(error)
    }
};