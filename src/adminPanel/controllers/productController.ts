import { type Request,type Response,type NextFunction } from "express";
import {Product} from '../../models/Products';
import {z} from 'zod';

const schemaProduct = z.object({
    country:z.string(),
    isp:z.string(),
    period:z.string(),
    price:z.coerce.number(),
    apikey:z.string()
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
        const {country,isp,period,price,apikey} = parsed.data;
        const createProduct = await Product.create({
            country:country.toLowerCase(),
            isp:isp.toLowerCase(),
            period:period,
            price:price,
            apikey:apikey
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
        const {country,isp,period,price,apikey} = parsed.data;
        const deleteProduct = await Product.findOneAndDelete(
            {
                country:country.toLowerCase(),
                isp:isp.toLocaleLowerCase(),
                period,
                price,
                apikey});
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
        const {country,isp,period,price,apikey} = parsed.data;
        const updateProduct = await Product.findOneAndUpdate({
            country:country.toLowerCase(),
            isp:isp.toLocaleLowerCase(),
            period:period,
            apikey:apikey
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