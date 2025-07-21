import { Bot, Context, InlineKeyboard } from "grammy";
import { redis } from "../utils/redis.ts";
import { deleteCachedMessages } from "../utils/cleanup.ts";
import {Order, type IOrder} from "../../models/Orders.ts";


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
    bot.callbackQuery(/period_(.+)_(.+)/,async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        const [_,orderId,period] = ctx.match ?? [];
        try {
            const ifOrderExists = await Order.findById(orderId);
            if(!ifOrderExists){
                const keyboard = new InlineKeyboard().text('Back',`my_orders`).row();
                const redisKey = `order_deleted_already${telegramId}`;
                const msg = await ctx.reply('Order does not exists',{
                    reply_markup:keyboard
                });
                await redis.pushList(redisKey,[String(msg.message_id)]);
                return;
            }
            const updateOrder = await Order.findByIdAndUpdate({id:orderId},{
                $set:{
                    expireAt:
                }
            })
        } catch (error) {
            console.log(error);
        }
    });
}
