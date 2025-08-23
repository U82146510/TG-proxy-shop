import {Order} from '../../models/Orders.ts';
import {canBuyOff} from '../utils/buyProxy.ts';

export async function deleteExpiredOrders():Promise<void>{
    try {
        const timeNow:Date = new Date();
        const expiredOrders = await Order.find({expireAt:{
            $lte:timeNow
        }});
        if(expiredOrders.length===0){
            console.log('No expired orders to be deleted');
            return;
        }
        for(const order of expiredOrders){
            console.log(`Deleting expired order: ${order.id}`);
            await canBuyOff(order.eid,"1");
            await order.deleteOne();
        }
    } catch (error) {
        console.error('Error at deleteing orders and returning proxy back to sale');
    }
};