import { getUSDTbalance } from './udtPayment.ts';
import { Decimal } from 'decimal.js';
import { User } from '../../models/User.ts';
import { Bot, Context } from 'grammy';
import {redis} from '../utils/redis.ts';
import {shopBalance} from '../../models/shopBalance.ts';
import mongoose from 'mongoose';
const Decimal128 = mongoose.Types.Decimal128;


export async function checkForDeposits(bot: Bot<Context>): Promise<void> {
    try {
        console.log('🔍 Checking for deposits...');

        const now = new Date();


        const users = await User.find({
            hasPendingDeposit: true,
            expectedAmountExpiresAt: { $gt: now }
        });

        if (users.length === 0) {
            console.log('✅ No pending deposits');
        } else {
            for (const user of users) {
                try {
                    if (user.wallets.length===0) {
                        console.log(`⚠️ User ${user.userId} has no TRON address`);
                        continue;
                    }
                    const wallet = user.wallets[user.wallets.length-1];
                    const balance = await getUSDTbalance(wallet.tronAddress);
                    if (balance === undefined || balance.isNaN()) {
                        console.log(`⏩ Skipping user ${user.userId} - invalid balance`);
                        continue;
                    }

                    const expected = new Decimal(wallet.expectedAmount?.toString() || '0');
                    const current = new Decimal(balance);
                    const tolerance = new Decimal(0.0001);

                    if (current.greaterThanOrEqualTo(expected.minus(tolerance))) {
                        // Update user balance
                        const newBalance = new Decimal(user.balance.toString()).plus(current);
                        await User.updateOne(
                        { _id: user._id, 'wallets._id': wallet._id },
                        {   $inc: { balance: Decimal128.fromString(current.toString()) },
                            $set: {
                            'wallets.$.hasPendingDeposit': false,
                            'wallets.$.used': true,
                            'wallets.$.expectedAmount': Decimal128.fromString("0"),
                            'wallets.$.expectedAmountExpiresAt': undefined
                            }
                        }
                        );

                    const commision = current.mul(0.1).toDecimalPlaces(6);
                    await shopBalance.findOneAndUpdate(
                        { key: 'shop-status' },
                        {
                            $setOnInsert: {
                                Month: Decimal128.fromString("0"),
                                Total: Decimal128.fromString("0"),
                                shop: Decimal128.fromString("0")
                            },
                            $inc: {
                                Month: Decimal128.fromString(current.toString()),
                                Total: Decimal128.fromString(current.toString()),
                                shop: Decimal128.fromString(commision.toString())
                            }
                        },
                        { upsert: true, new: true }
                    );

                        // Notify user
                       const sentMsg =  await bot.api.sendMessage(
                            user.userId,
                            `💰 Deposit of ${current.toFixed(6)} USDT received!\n` +
                                `🆕 Balance: ${newBalance} USDT`
                        );
                        await redis.pushList(`deposit_confirm_${user.userId}`,[String(sentMsg.message_id)])
                        console.log(`✅ Credited ${user.userId}`);
                    } else {
                        console.log(
                            `⏳ Pending deposit for ${user.userId}: ${current.toFixed(6)}/${expected.toFixed(6)} USDT`
                        );
                    }
                } catch (userError) {
                    console.error(`❌ Error processing ${user.userId}:`, userError);
                }
            }
        }

        try {
            const expiredUsers = await User.find({
                hasPendingDeposit: true,
                expectedAmountExpiresAt: { $lte: now }
            });

            for (const expiredUser of expiredUsers) {
                const wallet = expiredUser.wallets[expiredUser.wallets.length-1];
                wallet.hasPendingDeposit = false;
                wallet.used = true;
                wallet.expectedAmount = Decimal128.fromString("0");
                wallet.expectedAmountExpiresAt = undefined;
                await expiredUser.save();

                const expiredMSg = await bot.api.sendMessage(
                    expiredUser.userId,
                    '⚠️ Your deposit window expired. Please create a new deposit if you want to add balance.'
                );
                await redis.pushList(`deposit_expired_${expiredUser.userId}`,[String(expiredMSg.message_id)]);
                console.log(`⌛ Cleared expired deposit for user ${expiredUser.userId}`);
            }
        } catch (error) {
            console.error('Error at removing expired payment orders',error);
        }

        
    } catch (error) {
        console.error('💥 Deposit check failed:', error);
    }
}
