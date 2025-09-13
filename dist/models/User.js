"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
;
;
const walletSchema = new mongoose_1.Schema({
    tronAddress: { type: String },
    tronPrivateKey: { type: String },
    hasPendingDeposit: { type: Boolean, default: false },
    expectedAmount: { type: mongoose_1.Schema.Types.Decimal128, default: mongoose_1.Types.Decimal128.fromString("0") },
    expectedAmountExpiresAt: { type: Date },
    used: { type: Boolean, default: false }
}, { timestamps: true });
const userSchema = new mongoose_1.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: mongoose_1.Schema.Types.Decimal128, default: mongoose_1.Types.Decimal128.fromString("0") },
    orders: [{ type: mongoose_1.Schema.Types.ObjectId, ref: "Order" }],
    wallets: [walletSchema]
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
