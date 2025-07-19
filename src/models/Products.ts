import {Document,model,Schema} from "mongoose";

interface IPack {
        _id:string;
        name:string;
        eid:string;
        period:{
            duration:'1'|'7'|'14'|'30',
            price:number,
            _id:string;
        }[]
};

interface IProduct extends Document{
    Country:string;
    ISP:IPack[];
};

const productPack = new Schema<IPack>({
    name:{type:String,required:true},
    period:[{
        duration:{type:String,enum:['1','7','14','30'],required:true},
        price:Number
    }]
},{_id:true});

const productSchema = new Schema<IProduct>({
    Country:{type:String,unique:true,required:true},
    ISP:[productPack]
});

export const Product = model<IProduct>("Product",productSchema);