import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { User } from "../../models/User.ts";
import { generateWallet } from "../services/udtPayment.ts";


export function registerBalanceMenu(bot:Bot<Context>){
    bot.callbackQuery('my_balance', async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }

        try {
            await deleteCachedMessages(ctx,`start_menu_${telegramId}`);
            await deleteCachedMessages(ctx, `back_${telegramId}`);
            const user = await User.findOne({ userId: telegramId });
            if (!user) {
                await ctx.reply('❌ No such user found.');
                return;
            }

            const keyboard = new InlineKeyboard()
                .text('➕ Add Balance', 'add_balance').row()
                .text('🏠 Main Menu', 'back_to_menu').row();

            const formattedBalance = new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }).format(Number(user.balance));

            const message = `👤 *Account Details*\n\n💰 *Balance:* \`${formattedBalance}\` USDT`;

            const redisKey = `user_balance${telegramId}`;
            const msg = await ctx.reply(message, {
                reply_markup: keyboard,
                parse_mode: 'MarkdownV2',
            });

            await redis.pushList(redisKey, [String(msg.message_id)]);
        } catch (error) {
            console.error(error);
            await ctx.reply('⚠️ Error showing balance.');
        }
    });
    

    bot.callbackQuery('add_balance',async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) return;
        try {
            const redisKey = `inpurt_balance${telegramId}`
            const msg = await ctx.reply('💰 Enter the amount of USDT you want to deposit:');
            await redis.pushList(redisKey,[String(msg.message_id)]);
            bot.on('message:text',async(ctx2:Context)=>{
                const input = ctx2.message?.text?.trim()
                if(!input){
                    return
                }
                const amount = parseFloat(input);
                if(isNaN(amount) || amount<=0){
                    await ctx2.reply('❌ User not found.');
                    return;
                }
                const user = await User.findOne({userId:telegramId});
                if(!user){
                    await ctx2.reply('❌ User not found.');
                    return;
                }

                if(!user.tronAddress||!user.tronPrivateKey){
                    const wallet = await generateWallet();
                    if(!wallet){
                        await ctx2.reply('⚠️ Failed to generate wallet.');
                        return;
                    }
                    user.tronAddress=wallet.address;
                    user.tronPrivateKey=wallet.privateKey;
                }
                user.hasPendingDeposit=true;
                user.expectedAmount=amount.toFixed(6);
                await user.save();
                await ctx2.reply(
            `✅ Please send *${amount} USDT* to the following TRC20 address:\n\`\`\`${user.tronAddress}\`\`\`\n\nOnce received, your balance will be updated automatically.`,
                { parse_mode: 'Markdown' }
        );
            })
        } catch (error) {
            console.error(error)
        }
    })
}