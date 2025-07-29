import {Document,model,Schema} from 'mongoose';

interface IBalance extends Document{
    key: string;
    Month:number;
    Total:number;
    shop:number
};

const incomeStatistics = new Schema<IBalance>({
    key: { type: String, default: 'shop-status', unique: true },
    Month:{type:Number,default:0},
    Total:{type:Number,default:0},
    shop:{type:Number,default:0}
});

export const shopBalance = model<IBalance>('Shop',incomeStatistics);