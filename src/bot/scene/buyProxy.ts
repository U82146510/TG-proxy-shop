import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { Product } from "../../models/Products.ts";
import { getProxy ,type Proxy} from '../fetch.ts'
import {User} from '../../models/User.ts';
import {Order} from '../../models/Orders.ts';
import {Decimal} from "decimal.js";
import { Types } from "mongoose";
import {format, addDays } from 'date-fns';
import {fetchProxy} from '../utils/buyProxy.ts';

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
            const product = await Product.find();
            if(product.length === 0){
                const redisKey = `no_products${telegramId}`;
                const msg = await ctx.reply('There are not products added yet',{
                    reply_markup:keyboard.text('Back','back_to_menu').row()
                });
                await redis.pushList(redisKey,[String(msg.message_id)])
                return;
            }
            const countries = new Set<string>();
            for(const arg of product){
                countries.add(arg.country);
            }
            for(const arg of countries){
                keyboard.text(`${arg}`,`country_${arg}`).row();
            }
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
            const selectedIsp = arrayofISP.find(value=>value.operator.toLowerCase()===ispName.toLocaleLowerCase());
            if (!selectedIsp) return;
            const eid = selectedIsp.eid;
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

    bot.callbackQuery(/period_(.+)_(.+)_(.+)_(.+)/, async (ctx: Context) => {
        await ctx.answerCallbackQuery();
         const telegramId = ctx.from?.id;
        if (!telegramId) return;

        const [_, countryName, ispName, eid, period] = ctx.match ?? [];

        try {
            await deleteCachedMessages(ctx, `operator_${telegramId}`);
            const findProduct = await Product.findOne({isp:ispName.toLowerCase(),period:period});
            if(!findProduct){
                await ctx.reply('Product wasnt found')
                return
            }
            
            const keyboard = new InlineKeyboard()
                .text('🧾 Checkout', `checkout_${eid}_${period}_${ispName}`).row()
                .text('🔙 Back', `operator_${countryName}_${ispName}`)
                .text('🏠 Main Menu', 'back_to_menu').row();

            const messageText = [
                `🛒 <b>Order Summary</b>`,
                ``,
                `🌍 <b>Country:</b> ${findProduct.country}`,
                `🏢 <b>Operator:</b> ${findProduct.isp}`,
                `🆔 <b>EID:</b> <code>${eid}</code>`,
                `⏳ <b>Period:</b> ${findProduct.period} day(s)`,
                `💰 <b>Price:</b> $${findProduct.price}`,
                ``,
                `💳 Choose an action below:`
            ].join('\n');

            const msg = await ctx.reply(messageText, {
                reply_markup: keyboard,
                parse_mode: 'HTML'
            });
            
            const redisKey = `period_${telegramId}`;
            await redis.pushList(redisKey, [String(msg.message_id)]);
        } catch (error) {
            console.log(error);
        }
    });

    bot.callbackQuery(/checkout_(.+)_(.+)_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        const [_,eid, period,ispName] = ctx.match ?? [];
        if(!telegramId){
            return;
        }
        try {
            await deleteCachedMessages(ctx,`period_${telegramId}`);

            const product = await Product.findOne({isp:ispName.toLowerCase(),period:period});
            if(!product){
                return;
            }
            const user = await User.findOne({userId:telegramId});
            if(!user){
                return;
            }
            const periodDays:number = parseInt(period,10);
            if(isNaN(periodDays)|| periodDays<=0){
                throw new Error('Invalid period value');
            }
            const expireAt:Date = addDays(new Date(),periodDays);
            
            const productPrice = new Decimal(product.price);
            const userBalance = new Decimal(user.balance);
            if(userBalance.lessThan(productPrice)){
                const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `inssuficent_balance_${telegramId}`
                const msg = await ctx.reply("🚫 Insufficient balance.",{
                    reply_markup:keyboard
                });
                await redis.pushList(redisKey,[String(msg.message_id)]);
                return;
            }
            const total = userBalance.minus(productPrice);
            await User.findOneAndUpdate({userId:telegramId},{
                $set:{
                    balance:total
                }
            });

            const comment:string = telegramId as unknown as string;
            const expireProxy: string = format(expireAt, 'yyyy-MM-dd HH:mm:ss'); 
            const proxyLoginDetails =  await fetchProxy(eid,comment,expireProxy);
 
            const addOrder = await Order.create({
                userId:telegramId,
                country:'Moldova',
                isp:ispName.toLowerCase(),
                price:productPrice,
                period:period,
                eid:proxyLoginDetails?.eid,
                proxy_id:proxyLoginDetails?.proxy_id,
                proxy_independent_http_hostname:proxyLoginDetails?.proxy_independent_http_hostname,
                proxy_independent_socks5_hostname:proxyLoginDetails?.proxy_independent_socks5_hostname,
                proxy_independent_port:proxyLoginDetails?.proxy_independent_port,
                proxy_http_port:proxyLoginDetails?.proxy_http_port,
                proxy_socks5_port:proxyLoginDetails?.proxy_socks5_port,
                proxy_hostname:proxyLoginDetails?.proxy_hostname,
                proxy_change_ip_url:proxyLoginDetails?.proxy_change_ip_url,
                user:proxyLoginDetails?.proxy_login,
                pass:proxyLoginDetails?.proxy_pass,
                expireAt:proxyLoginDetails?.proxy_exp
            })
            user.orders.push(addOrder._id as Types.ObjectId);
            await user.save()
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `balance_added${telegramId}`;
            const msg = await ctx.reply(`✅ Order placed successfully.\nNew balance: ${total.toFixed(2)} USDT`,{
                reply_markup:keyboard
            });
            await redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.error(error);
            await ctx.reply("❌ Something went wrong during checkout.");
        }
    });

};