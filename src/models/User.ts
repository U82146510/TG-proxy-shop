import { Types, Document, model, Schema } from "mongoose";
import {type IOrder } from "../models/Orders.ts";

export interface IUser extends Document {
    userId: string;
    balance: string;
    orders: (Types.ObjectId | IOrder)[];
}

const userSchema = new Schema<IUser>({
    userId: { type: String, required: true, unique: true },
    balance: { type: String, required: true, default: "0" },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
});

export const User = model<IUser>('User', userSchema);
