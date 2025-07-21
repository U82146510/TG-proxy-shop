import { Product } from "../models/Products.ts";
import { connect_db } from "../config/connectDB.ts";
export async function upload(){
    try {
        await connect_db()
        await Product.create({
            country:'Moldova',
            isp:'orange',
            period:"30",
            price:25
         })
    } catch (error) {
        console.error(error);
    }
};

upload()