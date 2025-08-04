import { type Request,type Response,type NextFunction } from "express";
import {Product} from '../../models/Products.ts';
import {z} from 'zod';

const schemaProduct = z.object({
    country:z.string(),
    isp:z.string(),
    period:z.string(),
    price:z.coerce.number(),
    eid:z.string()
})

export const productGet = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        res.render('product',{error:null,message:null})
    } catch (error) {
        next(error);
    }
}

export const createProduct = async (req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
         if(!parsed.success){
            res.status(400).render('product',{error:'Wrong input',message:null});
            return;
        }
        const {country,isp,period,price,eid} = parsed.data;
        const createProduct = await Product.create({
            country:country,
            isp:isp,
            period:period,
            price:price,
            eid:eid
        });
        res.status(201).render('product',{error:null,message:`Pruduct ${createProduct.country} created`});
    } catch (error) {
        next(error)
    }
};



export const deleteProduct = async (req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('product',{error:'Wrong input',message:null});
            return;
        }
        const {country,isp,period,price,eid} = parsed.data;
        const deleteProduct = await Product.findOneAndDelete({country,isp,period,price,eid});
        if (!deleteProduct) {
             return res.status(404).render('product',{ error: 'Product not found',message:null });
        }
        res.status(200).render('product',{error:null,message:`Product ${deleteProduct?.country} deleted`});
    } catch (error) {
        next(error)
    }
};



export const updateProduct = async(req:Request,res:Response,next:NextFunction)=>{
    const parsed = schemaProduct.safeParse(req.body);
    try {
        if(!parsed.success){
            res.status(400).render('product',{error:'Wrong input',message:null});
            return;
        }
        const {country,isp,period,price,eid} = parsed.data;
        const updateProduct = await Product.findOneAndUpdate({
            country:country,
            isp:isp,
            period:period,
            eid:eid
        },{
            $set:{
                price:price
            }
        },{new:true});
        if (!updateProduct) {
             return res.status(404).render('product',{ error: 'Product not found',message:null });
        }

        res.status(200).render('product',{error:null,message:`Product ${updateProduct.country} updated`})
    } catch (error) {
        next(error)
    }
};