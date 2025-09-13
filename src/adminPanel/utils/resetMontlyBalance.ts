import cron from 'node-cron';
import {shopBalance} from '../../models/shopBalance';

export function resetBalanceEveryMonth():void{
    cron.schedule('0 0 1 * *',async()=>{
        try {
            await shopBalance.findOneAndUpdate({key:'shop-status'},{
                $set:{
                    Month:0
                }
            },{
                new:true,
                upsert:true
            });
            console.log('[Cron] Monthly balance reset.');
        } catch (error) {
            console.error('[Cron] Failed to reset balance:', error);
        }
    })
};