import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  userId: string;
  balance: string;
  orders: Schema.Types.ObjectId[];
  tronAddress: string;
  tronPrivateKey: string;
  hasPendingDeposit: boolean;
  expectedAmount: string;
  expectedAmountExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  balance: { type: String, default: "0" },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  tronAddress: { type: String },
  tronPrivateKey: { type: String },
  hasPendingDeposit: { type: Boolean, default: false },
  expectedAmount: { type: String },
  expectedAmountExpiresAt: { type: Date }
}, { timestamps: true });

export const User = model<IUser>("User", userSchema);
