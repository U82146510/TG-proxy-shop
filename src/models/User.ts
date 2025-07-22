import { Types, Document, model, Schema } from "mongoose";
import { type IOrder } from "../models/Orders.ts";

export interface IUser extends Document {
    userId: string;                     
    balance: string;
    orders: (Types.ObjectId | IOrder)[];

    tronAddress: string; 
    tronPrivateKey: string;
    hasPendingDeposit: boolean; 
    expectedAmount: string; 

    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        userId: { type: String, required: true, unique: true },
        balance: { type: String, required: true, default: "0" },
        orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],

        tronAddress: { type: String },
        tronPrivateKey: { type: String }, 

        hasPendingDeposit: { type: Boolean, default: false },
        expectedAmount: { type: String },
    },
    {
        timestamps: true,
    }
);

export const User = model<IUser>("User", userSchema);
