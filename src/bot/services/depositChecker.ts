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
                    if (!user.tronAddress) {
                        console.log(`⚠️ User ${user.userId} has no TRON address`);
                        continue;
                    }

                    const balance = await getUSDTbalance(user.tronAddress);
                    if (balance === undefined || balance.isNaN()) {
                        console.log(`⏩ Skipping user ${user.userId} - invalid balance`);
                        continue;
                    }

                    const expected = new Decimal(user.expectedAmount?.toString() || '0');
                    const current = new Decimal(balance);
                    const tolerance = new Decimal(0.0001);

                    if (current.greaterThanOrEqualTo(expected.minus(tolerance))) {
                        // Update user balance
                        const newBalance = new Decimal(user.balance.toString()).plus(current).toFixed(6);
                        user.balance = Decimal128.fromString(newBalance.toString());
                        user.hasPendingDeposit = false;
                        user.expectedAmount = Decimal128.fromString("0");
                        user.expectedAmountExpiresAt = undefined;
                        await user.save();

                        
                     const shopTotalbalance = await shopBalance.findOneAndUpdate(
                        { key: 'shop-status' },
                        {
                            $setOnInsert: {
                                Month: Decimal128.fromString("0"),
                                Total: Decimal128.fromString("0"),
                                shop: Decimal128.fromString("0")
                            }
                        },
                        { new: true, upsert: true }
                    );

                    const monthIncome = new Decimal(shopTotalbalance.Month.toString());
                    const totalIncome = new Decimal(shopTotalbalance.Total.toString());
                    const shopCommision = new Decimal(shopTotalbalance.shop.toString());

                    const finalMonthIncome = monthIncome.plus(current);
                    const finalTotalIncome = totalIncome.plus(current);
                    const commision = current.mul(0.1);
                    const finalShopCommision = shopCommision.plus(commision);

                    await shopBalance.findOneAndUpdate(
                        { key: 'shop-status' },
                        {
                            $set: {
                                Month: Decimal128.fromString(finalMonthIncome.toString()),
                                Total: Decimal128.fromString(finalTotalIncome.toString()),
                                shop: Decimal128.fromString(finalShopCommision.toString())
                            }
                        },
                        { new: true, upsert: true }
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


        const expiredUsers = await User.find({
            hasPendingDeposit: true,
            expectedAmountExpiresAt: { $lte: now }
        });

        for (const expiredUser of expiredUsers) {
            expiredUser.hasPendingDeposit = false;
            expiredUser.expectedAmount = Decimal128.fromString("0");
            expiredUser.expectedAmountExpiresAt = undefined;
            await expiredUser.save();

            const expiredMSg = await bot.api.sendMessage(
                expiredUser.userId,
                '⚠️ Your deposit window expired. Please create a new deposit if you want to add balance.'
            );
            await redis.pushList(`deposit_expired_${expiredUser.userId}`,[String(expiredMSg.message_id)]);
            console.log(`⌛ Cleared expired deposit for user ${expiredUser.userId}`);
        }
    } catch (error) {
        console.error('💥 Deposit check failed:', error);
    }
}
