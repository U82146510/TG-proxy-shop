import { Bot, Context, InlineKeyboard } from "grammy";
import { redis } from "../utils/redis.ts";
import { deleteCachedMessages } from "../utils/cleanup.ts";
import {Order} from "../../models/Orders.ts";
import { addDays } from 'date-fns';
import {User} from '../../models/User.ts';
import {Product} from '../../models/Products.ts';
import {Decimal} from "decimal.js";

export function orderHandler(bot: Bot<Context>) {
    bot.callbackQuery('my_orders', async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }

        try {
            await deleteCachedMessages(ctx,`start_menu_${telegramId}`);
            await deleteCachedMessages(ctx, `back_${telegramId}`);
            await deleteCachedMessages(ctx,`extend_${telegramId}`);
            await deleteCachedMessages(ctx,`order_deleted_already${telegramId}`);
            await deleteCachedMessages(ctx,`order_extended_success_${telegramId}`);
            const orders = await Order.find({ userId: telegramId })
            if (orders.length===0) {
                const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `no_orders${telegramId}`;
                const msg = await ctx.reply("📭 You don't have any orders yet.",{
                    reply_markup:keyboard
                });
                await redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }

            const redisKey = `order_list${telegramId}`;
            for (const [index, order] of orders.entries()) {
                const expireDateFormatted = order.expireAt.toLocaleDateString('en-US',{
                    year:'numeric',
                    month:'short',
                    day:'numeric'
                })
                const msgText = `📦 <b>Order #${index + 1}</b>\n\n` +
                    `🌍 Country: <b>${order.country}</b>\n` +
                    `📡 ISP: <b>${order.isp}</b>\n` +
                    `🗓️ Expires on: <b>${expireDateFormatted}</b>\n`+
                    `💰 Price: <b>$${order.price}</b>\n` +
                    `🆔 EID: <code>${order.eid}</code>`;

                const keyboard = new InlineKeyboard()
                    .text("⏳ Extend", `extend_order_${order._id}`)
                    .row();
                const msg = await ctx.reply(msgText, {
                    parse_mode: "HTML",
                    reply_markup: keyboard,
                });

                await redis.pushList(redisKey, [String(msg.message_id)]);
            }


            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const menuMsg = await ctx.reply('⬅️ Return to main menu', { reply_markup: keyboard });
            await redis.pushList(`order_menu_back_${telegramId}`, [String(menuMsg.message_id)]);
        } catch (error) {
            console.error("❌ Failed to fetch orders:", error);
            await ctx.reply("⚠️ Failed to fetch your orders. Please try again later.");
        }
    });

    bot.callbackQuery(/extend_order_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if(!telegramId){
            return;
        }
        const [_,orderId] = ctx.match ?? [];

        try {
            await deleteCachedMessages(ctx,`order_list${telegramId}`);
            await deleteCachedMessages(ctx,`order_menu_back_${telegramId}`);
            const keyboard = new InlineKeyboard();
            keyboard.text('1 day',`period_${orderId}_1`).row();
            keyboard.text('7 days',`period_${orderId}_7`).row();
            keyboard.text('14 days',`period_${orderId}_14`).row();
            keyboard.text('30 days',`period_${orderId}_30`).row();
            keyboard.text('Back',`my_orders`).row();
            keyboard.text('Main Menu','back_to_menu').row();

            const redisKey = `extend_${telegramId}`;
            const msg = await ctx.reply(`Choose period:`,{
                reply_markup:keyboard
            });
            await redis.pushList(redisKey,[String(msg.message_id)]);

        } catch (error) {
            console.error(error);
        }
    });
    bot.callbackQuery(/period_(.+)_(.+)/, async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        const [_, orderId, period] = ctx.match ?? [];

        try {
            await deleteCachedMessages(ctx,`extend_${telegramId}`);
            const order = await Order.findById(orderId);
            if (!order) {
                const keyboard = new InlineKeyboard().text('Back', `my_orders`).row();
                const redisKey = `order_deleted_already${telegramId}`;
                const msg = await ctx.reply('Order does not exist', {
                    reply_markup: keyboard
                });
                await redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }

            const currentDate = order.expireAt ?? new Date();
            const addedDays = parseInt(period, 10);
            if (isNaN(addedDays)) {
                await ctx.reply('Invalid period format.');
                return;
            }

            const newExpireDate = addDays(currentDate, addedDays);

            const product = await Product.findOne({ period: period, isp: order.isp });
            if (!product) {
                await ctx.reply('No matching product found.');
                return;
            }

            const user = await User.findOne({ userId: telegramId });
            if (!user) {
                await ctx.reply('No such user');
                return;
            }

            const productPrice = new Decimal(product.price);
            const userBalance = new Decimal(user.balance);
            if (userBalance.lessThan(productPrice)) {
                const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
                const redisKey = `insufficient_balance_when_extending${telegramId}`;
                const msg = await ctx.reply("🚫 Insufficient balance.", {
                    reply_markup: keyboard
                });
                await redis.pushList(redisKey, [String(msg.message_id)]);
                return;
            }

            
            const total = userBalance.minus(productPrice);
            user.balance = total.toString();
            order.expireAt = newExpireDate;
            //somwhere here I should make the request to extend order

            await user.save();
            await order.save();

            const keyboard = new InlineKeyboard().text('📦 My Orders', 'my_orders').row();
            keyboard.text('🏠 Main Menu', 'back_to_menu').row();
            const msg = await ctx.reply(`✅ Order extended by ${addedDays} day(s).\n🕒 New expiration: ${newExpireDate.toLocaleString()}`, {
                reply_markup: keyboard
            });

            const redisKey = `order_extended_success_${telegramId}`;
            await redis.pushList(redisKey, [String(msg.message_id)]);
        } catch (error) {
            console.log(error);
        }
    });

}
