import { Bot,Context,InlineKeyboard } from "grammy";
import {redis} from '../utils/redis.ts';
import {deleteCachedMessages} from '../utils/cleanup.ts';
import { User } from "../../models/User.ts";
import { generateWallet } from "../services/udtPayment.ts";
import crypto from 'crypto';
import dotnev from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";
import mongoose from "mongoose";
const Decimal128 = mongoose.Types.Decimal128; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname,'../../../.env');
const envResult = dotnev.config({path:envPath});
if(envResult.error){
    throw new Error('missing key encription')
}

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
                .text('➕ Add Balance', 'deposit_crypto').row()
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
    

    bot.callbackQuery('deposit_crypto',async(ctx:Context)=>{
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) {
            return;
        }
        try {
            await deleteCachedMessages(ctx, `user_balance${telegramId}`);
            const keyboard = new InlineKeyboard()
            .text('USDT', 'deposit_USDT').row()
            .text('TRX', 'deposit_TRX').row()
            .text('🏠 Main Menu', 'back_to_menu').row()

            const redisKey = `deposit_crypto${telegramId}`;
            const msg = await ctx.reply(`Choose Crypto:`,{
                reply_markup:keyboard
            });
            await redis.pushList(redisKey,[String(msg.message_id)]);
        } catch (error) {
            console.error(error);
            await ctx.reply('⚠️ Error choosing crypto type.');
        }
    });

    bot.callbackQuery(/deposit_(.+)/, async (ctx: Context) => {
        await ctx.answerCallbackQuery();
        const telegramId = ctx.from?.id;
        if (!telegramId) return;
        const [_,cryptoType] = ctx.match ?? [];
        try {
            await deleteCachedMessages(ctx,`deposit_crypto${telegramId}`);
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `input_balance${telegramId}`;
            const msg = await ctx.reply(
                '💰 *Enter the amount of USDT you want to deposit:*\n\n' +
                '⚠️ *Important:* Only the *last generated deposit request* will be accepted.\n' +
                'If you create a new one before paying the previous one, the earlier one will be ignored.\n\n' +
                '✅ After sending the exact amount, please *wait for confirmation*.\n\n' +
                '⏳ Deposit window is valid for 15 minutes.',
                {
                reply_markup:keyboard, parse_mode: 'Markdown',
                }
            );

            await redis.pushList(redisKey, [String(msg.message_id)]);
            await redis.set(`state:${telegramId}`, `awaiting_deposit_amount_${cryptoType}`);
        } catch (error) {
            console.error(error);
        }
    });



    bot.on('message:text', async (ctx2: Context) => {
        const telegramId = ctx2.from?.id;
        if (!telegramId) return;

        await deleteCachedMessages(ctx2, `input_balance${telegramId}`);
        const state = await redis.get(`state:${telegramId}`);
        if (!(state === 'awaiting_deposit_amount_USDT' || state === 'awaiting_deposit_amount_TRX')) {
            return;
        }

        const input = ctx2.message?.text?.trim();
        if (!input) {
            return;
        }
        const cryptoType = state.split("_")[3] as "USDT"|"TRX";
        const amount = Number(input);
        if (isNaN(amount) || amount <= 0) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `incorrect_amount${telegramId}`; // do not forget it
            const msg = await ctx2.reply('❌ Incorrect amount',{
                reply_markup:keyboard
            }); 
            await redis.pushList(redisKey,[String(msg.message_id)])
            return;
        }

        await deleteCachedMessages(ctx2, `inpurt_balance${telegramId}`);

        const user = await User.findOne({ userId: telegramId });
        if (!user) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const redisKey = `user_not_found${telegramId}`;  // do not forget it
            const msg = await ctx2.reply('❌ User not found.',{
                reply_markup:keyboard
            });
            await redis.pushList(redisKey,[String(msg.message_id)]);
            return;
        }

        user.wallets.forEach(w => {
            if (w.hasPendingDeposit) {
                w.hasPendingDeposit = false;
                w.used = true;
            }
        });
        
        const wallet = await generateWallet();
        if (!wallet) {
            const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
            const msg =  await ctx2.reply('⚠️ Failed to generate wallet.',{
                reply_markup:keyboard
            });
            await redis.pushList(`failed_to_generate${telegramId}`,[String(msg.message_id)])
            return;
        }

        const secretKey = process.env.encryptionKey;
        if(!secretKey){
            throw new Error('missing encryption key');
        }
        try {
            const keyBuffer = Buffer.from(secretKey,'hex');
            if(keyBuffer.length!==32){
                throw new Error('Encryption key must be 32 bytes (64 hex characters)');
            }
            const algorithm = 'aes-256-cbc';
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(algorithm,keyBuffer,iv);
            let encrypted = cipher.update(wallet.privateKey,'utf8','hex');
            encrypted+=cipher.final('hex');

            const expirationMinutes = 15;
            user.wallets.push({
                tronAddress:wallet.address,
                tronPrivateKey:`${iv.toString('hex')}:${encrypted}`,
                hasPendingDeposit:true,
                expectedAmount:Decimal128.fromString(amount.toString()),
                expectedAmountExpiresAt:new Date(Date.now() + expirationMinutes * 60 * 1000),
                currency:cryptoType,
                used:false,
            })
            await user.save();
            console.log(`✅ Saved TRON address for user ${telegramId}: ${wallet.address}`);
            } 
        catch (error) {
            console.error(error)
        }
        const newWallet = user.wallets[user.wallets.length - 1];
        const keyboard = new InlineKeyboard().text('🏠 Main Menu', 'back_to_menu').row();
        const redisKey1 = `generating_address${telegramId}`;
        const msg1 = await ctx2.reply(
            `✅ Please send *${amount} USDT* to the following TRC20 address:\n\`\`\`${newWallet.tronAddress}\`\`\`\n\nOnce received, your balance will be updated automatically.`,
            { reply_markup: keyboard, parse_mode: 'Markdown' }
        );
        await redis.pushList(redisKey1, [String(msg1.message_id)]);
        await redis.delete(`state:${telegramId}`);
    });

};