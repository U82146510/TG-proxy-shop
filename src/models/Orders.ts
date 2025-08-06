import {Document,model,Schema } from "mongoose";

export interface IOrder extends Document{
    userId:string;
    country:string;
    isp:string;
    price:number;
    period:string;
    eid:string;

    proxy_id:string;
    proxy_independent_http_hostname:string,
    proxy_independent_socks5_hostname:string,
    proxy_independent_port:string,
    proxy_http_port:string,
    proxy_socks5_port:string,
    proxy_hostname:string,
    proxy_change_ip_url:string,

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
    proxy_id:{type:String,required:true},
    proxy_independent_http_hostname:{type:String,required:true},
    proxy_independent_socks5_hostname:{type:String,required:true},
    proxy_independent_port:{type:String,required:true},
    proxy_http_port:{type:String,required:true},
    proxy_socks5_port:{type:String,required:true},
    proxy_hostname:{type:String,required:true},
    proxy_change_ip_url:{type:String,required:true},
    user: { type: String, required: true },
    pass: { type: String, required: true },
    expireAt: { type: Date, required: true }

});

orderSchema.index({expireAt:1},{expireAfterSeconds:0})

export const Order = model<IOrder>('Order',orderSchema);