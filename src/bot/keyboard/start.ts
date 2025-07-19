import { Bot, Context, InlineKeyboard } from 'grammy';
import {redis} from '../utils/redis.ts';
export function registerMainMenu(bot:Bot<Context>){
    bot.command("start",async(ctx:Context)=>{
        const telegramId = ctx.from?.id;
        const username = ctx.from?.username;
        const firstName = ctx.from?.first_name ?? 'Anonymous';
        if(!telegramId){
            return;
        }
        const redisKey = `start_menu_${telegramId}`;
        const msg = await ctx.reply(`Welcome ${firstName}`,{
            reply_markup:mainMenu()
        });
        await redis.pushList(redisKey,[String(msg.message_id)]);
    });
}

export function mainMenu():InlineKeyboard{
    return new InlineKeyboard()
            .text('Buy Proxy',"buy_proxy").row()
            .text('My Balance','my_balance')
            .text('Orders','my_orders').row()
            .text('About','about').row()
            .text('Contact US','contact').row()
}