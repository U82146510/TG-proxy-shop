import cron from 'node-cron';
import {deleteExpiredOrders} from '../utils/returnProxybackToSale.ts';

export function deleteOrderAndReturnBackToSaleProxy():void{
    cron.schedule('*/10 * * * *',async()=>{
        try {
            await deleteExpiredOrders();
            console.log('[Cron] Delete order and return proxy back to sale');
        } catch (error) {
            console.error('[Cron] Failed to delete order and return proxy back to sale')
        }
    });
};