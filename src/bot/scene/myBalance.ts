import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { User } from "../../models/User.ts";

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

}