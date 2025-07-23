import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';


export function registerAboutMenu(bot:Bot<Context>):void{
    bot.callbackQuery('about',async(ctx:Context)=>{
        ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId){
            return;
        }
        try {
            await deleteCachedMessages(ctx,`back_${telegramId}`);
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const msg = await ctx.reply(``,{reply_markup:keyboard});
            await redis.pushList(`about_${telegramId}`,[String(msg.message_id)]);
        } catch (error) {
            console.error(error);
        }
    });
}