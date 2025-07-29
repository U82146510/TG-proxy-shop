import cron from 'node-cron';
import {shopBalance} from '../../models/shopBalance.ts';

export function resetBalanceEveryMonth():void{
    cron.schedule('0 0 1 * *',async()=>{
        try {
            const result = await shopBalance.findOneAndUpdate({key:'shop-status'},{
                $set:{
                    Month:0
                }
            },{
                new:true,
                upsert:true
            })
        } catch (error) {
            console.error(error);
        }
    })
};