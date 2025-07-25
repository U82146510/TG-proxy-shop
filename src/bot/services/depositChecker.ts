import { getUSDTbalance } from './udtPayment.ts';
import { Decimal } from 'decimal.js';
import { User } from '../../models/User.ts';
import { Bot, Context } from 'grammy';
import {redis} from '../utils/redis.ts';

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
                    if (balance === undefined || isNaN(balance)) {
                        console.log(`⏩ Skipping user ${user.userId} - invalid balance`);
                        continue;
                    }

                    const expected = new Decimal(user.expectedAmount || '0');
                    const current = new Decimal(balance);
                    const tolerance = new Decimal(0.0001);

                    if (current.greaterThanOrEqualTo(expected.minus(tolerance))) {
                        // Update user balance
                        const newBalance = new Decimal(user.balance).plus(current).toFixed(6);
                        user.balance = newBalance;
                        user.hasPendingDeposit = false;
                        user.expectedAmount = '';
                        user.expectedAmountExpiresAt = undefined;
                        await user.save();

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
            expiredUser.expectedAmount = '';
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
