import {Document,model,Schema} from "mongoose";
interface IProduct extends Document{
    country:string;
    isp:string;
    period:string;
    price:string;
    eid:string
};

const producSchema = new Schema<IProduct>({
    country:{type:String,required:true},
    isp:{type:String,required:true},
    period:{type:String,required:true},
    price:{type:String,required:true},
    eid:{type:String,required:true}

});

export const Product = model('Product',producSchema);