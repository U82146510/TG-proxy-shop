import { type Request,type Response,type NextFunction } from "express";
import {shopBalance} from '../../models/shopBalance.ts';

export const incomeStatistics = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const moneyStatistics = await shopBalance.findOne({key:'shop-status'});
        if(!moneyStatistics){
            res.status(404).json({error:'Balance record not found'})
            return;
        }
        const {Month} = moneyStatistics;
        console.log(Month)
    } catch (error) {
        next(error)
    }
};