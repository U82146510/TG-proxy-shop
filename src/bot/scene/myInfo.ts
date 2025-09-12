import { Bot, Context, InlineKeyboard } from 'grammy';
import { redis } from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';

export function myInfoMenu(bot: Bot<Context>): void {
    bot.callbackQuery('myinfo', async (ctx: Context) => {
        try {
            await ctx.answerCallbackQuery();
        } catch (error:any) {
            if(error?.response?.description?.includes("query is too old")){
                console.log("⚠️ Callback query already answered, skipping...");
            }else{
                throw error;
            }
        }
        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        await deleteCachedMessages(ctx,`start_menu_${telegramId}`);
        await deleteCachedMessages(ctx, `back_${telegramId}`);
        function escapeMarkdownV2(text: string) {
            return text.replace(/([_*\[\]()~`>#+\-=|{}.!])/g, '\\$1');
        }

        const keyboard = new InlineKeyboard()
            .text('🏠 Main Menu', 'back_to_menu')
            .row();

        const languageCode = ctx.from?.language_code ?? 'unknown';

        const msgEN = `*ℹ️ My Information*\n\n*🆔 ID:* \`${telegramId}\`\n\n💬 For help, contact support: @GlobalProxy_support`;
        const msgRU = `*ℹ️ Моя информация*\n\n*🆔 ID:* \`${telegramId}\`\n\n💬 Если возникли вопросы — обращайтесь в поддержку: @GlobalProxy_support`;

        const displayMSG = escapeMarkdownV2(languageCode === 'ru' ? msgRU : msgEN);

        const redisKey = `myinfomenu${telegramId}`;
        const msg = await ctx.reply(displayMSG, {
            reply_markup: keyboard,
            parse_mode: 'MarkdownV2'
        });

        await redis.pushList(redisKey, [String(msg.message_id)]);
    });
};
