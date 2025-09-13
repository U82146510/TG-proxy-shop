import { Bot, Context, InlineKeyboard } from "grammy";
import { redis } from '../utils/redis';
import { deleteCachedMessages } from '../utils/cleanup';

export function registerAboutMenu(bot: Bot<Context>): void {
    bot.callbackQuery('about', async (ctx: Context) => {
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

        try {
            await deleteCachedMessages(ctx, `back_${telegramId}`);
            await deleteCachedMessages(ctx,`start_menu_${telegramId}`)

            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const languageCode = ctx.from?.language_code ?? 'unknown';

            const aboutRU = `Добро пожаловать в @GlobalProxy__bot!
Мы подберём идеальный тариф под ваши задачи. Более 5 лет в сфере мобильных 4G-прокси. Проконсультируем по всем вопросам — @GlobalProxy_support`;

            const aboutEN = `Welcome to @GlobalProxy__bot!
We'll help you find the perfect plan for your needs. Over 5 years in the mobile 4G proxy industry. Contact support for a free consultation — @GlobalProxy_support`;

            const displayText = languageCode === 'ru' ? aboutRU : aboutEN;

            const msg = await ctx.reply(displayText, {
                reply_markup: keyboard
            });

            await redis.pushList(`about_${telegramId}`, [String(msg.message_id)]);
        } catch (error) {
            console.error(error);
        }
    });
}
