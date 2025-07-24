import { Bot,Api,Context } from "grammy";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from "url";
import {registerMainMenu} from './keyboard/start.ts';
import {registerBuyProxyHandler} from './scene/buyProxy.ts';
import {redis} from './utils/redis.ts';
import {backToMainMenu} from './common/backMenu.ts';
import {connect_db} from '../config/connectDB.ts';
import {orderHandler} from '../bot/scene/orders.ts';
import {registerBalanceMenu} from './scene/myBalance.ts';
import {startDepositChecker} from './job/depositChecker.ts';
import {registerAboutMenu} from './scene/aboutMenu.ts';
import {helpMenu} from './scene/helpMenu.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path:path.resolve(__dirname,'../../.env')
});

const bot_token = process.env.bot_token;
if(!bot_token){
    throw new Error('missing telegram token')
};

const bot:Bot<Context,Api>  = new Bot(bot_token);


const start = async()=>{
    try {
        await connect_db();
        await redis.connect();
        registerBuyProxyHandler(bot);
        registerMainMenu(bot);
        backToMainMenu(bot);
        orderHandler(bot);
        registerBalanceMenu(bot);
        registerAboutMenu(bot);
        startDepositChecker(bot);
        helpMenu(bot);
        await bot.start();
    } catch (error) {
        console.error(error);
    }
};

start();