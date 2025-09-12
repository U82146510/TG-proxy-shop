import { Bot, Context, InlineKeyboard } from "grammy";
import { mainMenu } from '../keyboard/start.ts';
import { deleteCachedMessages } from "../utils/cleanup.ts";
import { redis } from '../utils/redis.ts';

export function backToMainMenu(bot: Bot<Context>) {
    bot.callbackQuery('back_to_menu', async (ctx: Context) => {
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
        const firstName = ctx.from?.first_name ?? 'Anonymous';
        const languageCode = ctx.from?.language_code ?? 'unknown';

        await deleteCachedMessages(ctx, `buy_proxy${telegramId}`);
        await deleteCachedMessages(ctx, `isp_${telegramId}`);
        await deleteCachedMessages(ctx, `operator_${telegramId}`);
        await deleteCachedMessages(ctx, `period_${telegramId}`);
        await deleteCachedMessages(ctx, `balance_added${telegramId}`);
        await deleteCachedMessages(ctx, `order_list${telegramId}`);
        await deleteCachedMessages(ctx, `no_orders${telegramId}`);
        await deleteCachedMessages(ctx, `order_list${telegramId}`);
        await deleteCachedMessages(ctx, `order_menu_back_${telegramId}`);
        await deleteCachedMessages(ctx, `inssuficent_balance_${telegramId}`);
        await deleteCachedMessages(ctx, `extend_${telegramId}`);
        await deleteCachedMessages(ctx, `inssuficent_balance_when_extending${telegramId}`);
        await deleteCachedMessages(ctx, `order_extended_success_${telegramId}`);
        await deleteCachedMessages(ctx, `user_balance${telegramId}`);
        await deleteCachedMessages(ctx, `generating_address${telegramId}`);
        await deleteCachedMessages(ctx, `deposit_confirm_${telegramId}`);
        await deleteCachedMessages(ctx, `deposit_expired_${telegramId}`);
        await deleteCachedMessages(ctx, `failed_to_generate${telegramId}`);
        await deleteCachedMessages(ctx, `about_${telegramId}`);
        await deleteCachedMessages(ctx, `help_menu${telegramId}`);
        await deleteCachedMessages(ctx, `inpurt_balance${telegramId}`);
        await deleteCachedMessages(ctx,`no_products${telegramId}`);
        await deleteCachedMessages(ctx,`user_not_found${telegramId}`);
        await deleteCachedMessages(ctx,`incorrect_amount${telegramId}`);
        await deleteCachedMessages(ctx,`myinfomenu${telegramId}`);
        await deleteCachedMessages(ctx,`deposit_crypto${telegramId}`);

       
        const msgRU = `Добро пожаловать в GlobalProxyShop!
Наш сервис предлагает одни из самых доступных 4G мобильных прокси и гибкие тарифы под любые задачи.
⚠️ Мы не предоставляем прокси под чёрные цели!
Вы несёте полную ответственность за использование сервиса и свои действия.`;

        const msgEN = `Welcome to GlobalProxyShop!
We offer some of the most affordable 4G mobile proxies and flexible pricing plans for any need.
⚠️ We do not provide proxies for illegal or black-hat purposes!
You are fully responsible for how you use this service.`;

        const displayMSG = languageCode === 'ru' ? msgRU : msgEN;

        const redisKey = `back_${telegramId}`;
        const msg = await ctx.reply(
            `Welcome ${firstName} (${languageCode})\n\n${displayMSG}`,
            { reply_markup: mainMenu() }
        );

        await redis.pushList(redisKey, [String(msg.message_id)]);
    });
}
