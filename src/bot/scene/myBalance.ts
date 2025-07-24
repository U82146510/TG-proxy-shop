import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { User } from "../../models/User.ts";
import { generateWallet } from "../services/udtPayment.ts";


export function registerBalanceMenu(bot:Bot<Context>){
    bot.callbackQuery('my_balance', async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }

        try {
            await deleteCachedMessages(ctx,`start_menu_${telegramId}`);
            await deleteCachedMessages(ctx, `back_${telegramId}`);
            const user = await User.findOne({ userId: telegramId });
            if (!user) {
                await ctx.reply('❌ No such user found.');
                return;
            }

            const keyboard = new InlineKeyboard()
                .text('➕ Add Balance', 'add_balance').row()
                .text('🏠 Main Menu', 'back_to_menu').row();

            const formattedBalance = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(user.balance));

            const message = `👤 *Account Details*\n\n💰 *Balance:* \`${formattedBalance}\` USDT`;

            const redisKey = `user_balance${telegramId}`;
            const msg = await ctx.reply(message, {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2',
            });

            await redis.pushList(redisKey, [String(msg.message_id)]);
        } catch (error) {
            console.error(error);
            await ctx.reply('⚠️ Error showing balance.');
        }
    });
    

bot.callbackQuery('add_balance', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    const telegramId = ctx.from?.id;
    if (!telegramId) return;

    try {
        await deleteCachedMessages(ctx, `user_balance${telegramId}`);
        const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
        const redisKey = `inpurt_balance${telegramId}`;
        const msg = await ctx.reply(
            '💰 *Enter the amount of USDT you want to deposit:*\n\n' +
            '⚠️ *Important:* Only the *last generated deposit request* will be accepted.\n' +
            'If you create a new one before paying the previous one, the earlier one will be ignored.\n\n' +
            '✅ After sending the exact amount, please *wait for confirmation*.\n\n' +
            '⏳ Deposit window is valid for 15 minutes.',
            {
               reply_markup:keyboard, parse_mode: 'Markdown',
            }
        );

        await redis.pushList(redisKey, [String(msg.message_id)]);
        await redis.set(`state:${telegramId}`, 'awaiting_deposit_amount');
    } catch (error) {
        console.error(error);
    }
});



    bot.on('message:text', async (ctx2: Context) => {
        const telegramId = ctx2.from?.id;
        if (!telegramId) return;

        await deleteCachedMessages(ctx2, `inpurt_balance${telegramId}`);
        const state = await redis.get(`state:${telegramId}`);
        if (state !== 'awaiting_deposit_amount') return;

        const input = ctx2.message?.text?.trim();
        if (!input) {
            return;
        }

        const amount = parseFloat(input);
        if (isNaN(amount) || amount <= 0) {
            await ctx2.reply('❌ User not found.');
            return;
        }

        await deleteCachedMessages(ctx2, `inpurt_balance${telegramId}`);

        const user = await User.findOne({ userId: telegramId });
        if (!user) {
            await ctx2.reply('❌ User not found.');
            return;
        }

        if (!user.tronAddress || !user.tronPrivateKey) {
            const wallet = await generateWallet();
            if (!wallet) {
                const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const msg =  await ctx2.reply('⚠️ Failed to generate wallet.',{
                    reply_markup:keyboard
                });
                await redis.pushList(`failed_to_generate${telegramId}`,[String(msg.message_id)])
                return;
            }
            user.tronAddress = wallet.address;
            user.tronPrivateKey = wallet.privateKey;
        }

 
        const expirationMinutes = 15;
        user.hasPendingDeposit = true;
        user.expectedAmount = amount.toFixed(6);
        user.expectedAmountExpiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000);

        await user.save();

        const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
        const redisKey1 = `generating_address${telegramId}`;
        const msg1 = await ctx2.reply(
            `✅ Please send *${amount} USDT* to the following TRC20 address:\n\`\`\`${user.tronAddress}\`\`\`\n\nOnce received, your balance will be updated automatically.`,
            { reply_markup: keyboard, parse_mode: 'Markdown' }
        );
        await redis.pushList(redisKey1, [String(msg1.message_id)]);
        await redis.delete(`state:${telegramId}`);
    });

};