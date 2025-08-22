import { Schema, model, Document,Types } from "mongoose";

export interface IUser extends Document {
  userId: string;
  balance: Types.Decimal128;
  orders: Schema.Types.ObjectId[];
  tronAddress: string;
  tronPrivateKey: string;
  hasPendingDeposit: boolean;
  expectedAmount: Types.Decimal128;
  expectedAmountExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  balance: { type: Schema.Types.Decimal128, default: Types.Decimal128.fromString("0") },
  orders: [{ type: Schema.Types.ObjectId, ref: "Order" }],
  tronAddress: { type: String },
  tronPrivateKey: { type: String },
  hasPendingDeposit: { type: Boolean, default: false },
  expectedAmount: { type: Schema.Types.Decimal128, default: Types.Decimal128.fromString("0") },
  expectedAmountExpiresAt: { type: Date }
}, { timestamps: true });

export const User = model<IUser>("User", userSchema);
