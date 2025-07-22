import {getUSDTbalance} from './udtPayment.ts';
import {Decimal} from 'decimal.js';
import { User } from '../../models/User.ts';
import { Bot,Context } from 'grammy';

export async function checkForDeposits(bot:Bot<Context>):Promise<void>{
    try {
        const users = await User.find({hasPendingDeposit:true});
        for(const user of users){
            const balance = await getUSDTbalance(user.tronAddress);
            if (typeof balance !== 'number' || isNaN(balance)) continue;

            const expected = parseFloat(user.expectedAmount);


            const decimalBalance = new Decimal(balance);
            const decimalExpected = new Decimal(expected);

            if (decimalBalance.greaterThanOrEqualTo(decimalExpected.minus(0.0001))) {
                user.balance = new Decimal(user.balance).plus(decimalBalance).toFixed(6);
                user.hasPendingDeposit = false;
                user.expectedAmount = '';
                await user.save();

                await bot.api.sendMessage(
                    user.userId,
                    `✅ Deposit of ${decimalBalance.toFixed(6)} USDT received!\nYour new balance is ${user.balance} USDT.`
                );
            }

        }

    } catch (error) {
        console.error(error);
    }
}