import {Document,model,Schema } from "mongoose";

export interface IOrder extends Document{
    userId:string;
    country:string;
    isp:string;
    price:number;
    period:string;
    eid:string;
    ip:string;
    user:string;
    pass:string;
    expireAt:Date
};

const orderSchema = new Schema<IOrder>({
    userId:{type:String,required:true},
    country:{type:String,required:true},
    isp:{type:String,required:true},
    price:{type:Number,required:true,default:0},
    period:{type:String,required:true},
    eid:{type:String,required:true},
    ip: { type: String, required: true },
    user: { type: String, required: true },
    pass: { type: String, required: true },
    expireAt: { type: Date, required: true }

});

orderSchema.index({expireAt:1},{expireAfterSeconds:0})

export const Order = model('Order',orderSchema);