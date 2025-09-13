import { type Request,type Response,type NextFunction } from "express";
import {shopBalance} from '../../models/shopBalance';

export const incomeStatistics = async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const moneyStatistics = await shopBalance.findOne({key:'shop-status'});
        if(!moneyStatistics){
            res.render('statistics',{
                Month:null,
                Total:null,
                shop:null,
                error:'Balance record not found'
            })
            return;
        }
        const {Month,Total,shop} = moneyStatistics;
        res.render('statistics',{
            Month,
            Total,
            shop,
            error:null
        })
    } catch (error) {
        next(error)
    }
};