import { Bot, Context, InlineKeyboard } from "grammy";
import { redis } from '../utils/redis.ts';
import { deleteCachedMessages } from '../utils/cleanup.ts';

export function helpMenu(bot: Bot<Context>): void {
    bot.callbackQuery('my_help', async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) return;

        try {
            await deleteCachedMessages(ctx, `back_${telegramId}`);
            await deleteCachedMessages(ctx,`start_menu_${telegramId}`)
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();

            const languageCode = ctx.from?.language_code ?? 'unknown';

            const msgRU = `⚠️ *Важно!*
Если вы сгенерировали транзакцию, но не произвели оплату, система будет считать последнюю созданную транзакцию актуальной.
Перед оплатой убедитесь, что используете актуальные реквизиты.

Если возникли вопросы — обращайтесь в поддержку: @GlobalProxy\\_support`;

            const msgEN = `⚠️ *Important!*
If you generate a transaction but do not complete the payment, the system will treat the last created transaction as the valid one.
Make sure to use the most recent payment details when sending funds.

For help, contact support: @GlobalProxy\\_support`;

            const displayMsg = languageCode === 'ru' ? msgRU : msgEN;

            const msg = await ctx.reply(displayMsg, {
                reply_markup: keyboard,
                parse_mode: 'Markdown'
            });

            await redis.pushList(`help_menu${telegramId}`, [String(msg.message_id)]);
        } catch (error) {
            console.error(error);
        }
    });
};
