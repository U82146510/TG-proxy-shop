import {Document,model,Schema} from "mongoose";
interface IProduct extends Document{
    country:string;
    isp:string;
    period:string;
    price:string;
    apikey:string
};

const producSchema = new Schema<IProduct>({
    country:{type:String,required:true,lowercase:true},
    isp:{type:String,required:true,lowercase:true},
    period:{type:String,required:true},
    price:{type:String,required:true},
    apikey:{type:String,required:true}

});

export const Product = model<IProduct>('Product',producSchema);