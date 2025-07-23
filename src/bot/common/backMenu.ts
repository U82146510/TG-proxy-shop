import { Bot,Context,InlineKeyboard } from "grammy";
import {mainMenu} from '../keyboard/start.ts';
import {deleteCachedMessages } from "../utils/cleanup.ts";
import {redis} from '../utils/redis.ts';

export function backToMainMenu(bot:Bot<Context>){
    bot.callbackQuery('back_to_menu',async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId) return;
        await deleteCachedMessages(ctx,`buy_proxy${telegramId}`);
        await deleteCachedMessages(ctx,`isp_${telegramId}`);
        await deleteCachedMessages(ctx,`operator_${telegramId}`);
        await deleteCachedMessages(ctx,`period_${telegramId}`);
        await deleteCachedMessages(ctx,`balance_added${telegramId}`);
        await deleteCachedMessages(ctx,`order_list${telegramId}`);
        await deleteCachedMessages(ctx,`no_orders${telegramId}`);
        await deleteCachedMessages(ctx,`order_list${telegramId}`);
        await deleteCachedMessages(ctx,`order_menu_back_${telegramId}`);
        await deleteCachedMessages(ctx,`inssuficent_balance_${telegramId}`);
        await deleteCachedMessages(ctx,`extend_${telegramId}`);
        await deleteCachedMessages(ctx,`inssuficent_balance_when_extending${telegramId}`);
        await deleteCachedMessages(ctx,`order_extended_success_${telegramId}`);
        await deleteCachedMessages(ctx,`user_balance${telegramId}`);
        await deleteCachedMessages(ctx,`generating_address${telegramId}`);
        await deleteCachedMessages(ctx,`deposit_confirm_${telegramId}`);
        await deleteCachedMessages(ctx,`deposit_expired_${telegramId}`);
        await deleteCachedMessages(ctx,`failed_to_generate${telegramId}`);
        await deleteCachedMessages(ctx,`about_${telegramId}`);
        const redisKey =`back_${telegramId}`;
        const msg = await ctx.reply('Main Menu:',{reply_markup:mainMenu()});
        redis.pushList(redisKey,[String(msg.message_id)]);
    })
}