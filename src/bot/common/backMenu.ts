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
        const redisKey =`back_${telegramId}`;
        const msg = await ctx.reply('Main Menu:',{reply_markup:mainMenu()});
        redis.pushList(redisKey,[String(msg.message_id)]);
    })
}