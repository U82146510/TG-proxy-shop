import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { Product } from "../../models/Products.ts";
import { getProxy ,type Proxy} from '../fetch.ts'


export function registerBuyProxyHandler(bot:Bot<Context>){
    bot.callbackQuery('buy_proxy',async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId){
            return;
        }


        await deleteCachedMessages(ctx,`start_menu_${telegramId}`);
        await deleteCachedMessages(ctx,`isp_${telegramId}`);
        await deleteCachedMessages(ctx,`back_${telegramId}`);


        
        try {
            
            const keyboard = new InlineKeyboard();
            keyboard.text('Moldova','country_moldova').row()
            keyboard.text('Back','back_to_menu').row();
            const redisKey = `buy_proxy${telegramId}`;
            const msg = await ctx.reply('Choose country:',{reply_markup:keyboard});
            await redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.error(error);
        }
        
    });


    bot.callbackQuery(/^country_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId){
            return;
        }

        await deleteCachedMessages(ctx,`buy_proxy${telegramId}`);
        await deleteCachedMessages(ctx,`operator_${telegramId}`);

        const [_, countryName] = ctx.match ?? [];
        if(!countryName){
            return;
        }
        try {
            const keyboard = new InlineKeyboard();
            const isps = await getProxy();
            if(!isps){
                return;
            }
            await redis.set('availableProxy',JSON.stringify(isps))
            const countTotalIsp = new Map<string,number>();
            for(const isp of isps){
                const total = countTotalIsp.get(isp.operator) || 0;
                countTotalIsp.set(isp.operator,total+1)
            }
           
            for(const isp of countTotalIsp){
                   keyboard.text(`${isp[0]}(${isp[1]})`,`operator_${countryName}_${isp[0]}`).row()
            }

            keyboard.text('Back','buy_proxy').row();
            keyboard.text('Main Menu','back_to_menu').row();
            const redisKey = `isp_${telegramId}`;
            const msg = await ctx.reply(`Available operators:`,{
                reply_markup:keyboard
            });
            redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.log(error)
        }
    });

    bot.callbackQuery(/operator_(.+)_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId){
            return;
        }
        const [_,countryName,ispName] = ctx.match ?? [];
        
        try {
            await deleteCachedMessages(ctx,`isp_${telegramId}`);
            await deleteCachedMessages(ctx,`period_${telegramId}`);
            const isps = await redis.get('availableProxy');
            if(!isps){
                return;
            }
            const arrayofISP = JSON.parse(isps) as Proxy[];
            const eid = arrayofISP.find(value=>value.operator.toLowerCase()===ispName.toLocaleLowerCase());
            const keyboard = new InlineKeyboard();
            keyboard.text('1 day',`period_${countryName}_${ispName}_${eid}_1`).row();
            keyboard.text('7 days',`period_${countryName}_${ispName}_${eid}_7`).row();
            keyboard.text('14 days',`period_${countryName}_${ispName}_${eid}_14`).row();
            keyboard.text('30 days',`period_${countryName}_${ispName}_${eid}_30`).row();
            keyboard.text('Back',`country_${countryName}`).row();
            keyboard.text('Main Menu','back_to_menu').row();


            const redisKey =`operator_${telegramId}`;
            const msg = await ctx.reply(`Select rent period:`,{
                reply_markup:keyboard
            });
            await redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.error(error);
        }
    });

    bot.callbackQuery(/period_(.+)_(.+)_(.+)_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
         if(!telegramId){
            return;
        }
        
        const [_,countryName,ispName,eid,period] = ctx.match ?? [];
        try {
            await deleteCachedMessages(ctx,`operator_${telegramId}`);
            const keyboard = new InlineKeyboard();
            keyboard.text('Checkout',`checkout_${eid}`);
            keyboard.text('Back',`country_${countryName}_${ispName}`).row();
            keyboard.text('Main Menu','back_to_menu').row();
            const redisKey = `period_${telegramId}`;
            const msg = await ctx.reply(``,{reply_markup:keyboard});
            await redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.log(error);
        }
    });
};