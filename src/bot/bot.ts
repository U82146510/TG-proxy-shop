import { Bot,Api,Context } from "grammy";
import dotenv from 'dotenv';
import path from 'path';
import {registerMainMenu} from './keyboard/start';
import {registerBuyProxyHandler} from './scene/buyProxy';
import {redis} from './utils/redis';
import {backToMainMenu} from './common/backMenu';
import {connect_db} from '../config/connectDB';
import {orderHandler} from '../bot/scene/orders';
import {registerBalanceMenu} from './scene/myBalance';
import {startDepositChecker} from './job/depositChecker';
import {registerAboutMenu} from './scene/aboutMenu';
import {helpMenu} from './scene/helpMenu';
import {startAdminPanel} from '../adminPanel/app';
import {resetBalanceEveryMonth} from '../adminPanel/utils/resetMontlyBalance';
import {deleteOrderAndReturnBackToSaleProxy} from './job/deleteOrderChecker';
import {myInfoMenu} from './scene/myInfo';


dotenv.config({
    path:path.resolve(__dirname,'../../.env')
});

const bot_token = process.env.bot_token;
if(!bot_token){
    throw new Error('missing telegram token')
};

export const bot:Bot<Context,Api>  = new Bot(bot_token);


const start = async()=>{
    try {
        await connect_db();
        await redis.connect();
        await startAdminPanel()
        registerBuyProxyHandler(bot);
        registerMainMenu(bot);
        backToMainMenu(bot);
        orderHandler(bot);
        registerBalanceMenu(bot);
        registerAboutMenu(bot);
        startDepositChecker(bot);
        helpMenu(bot);
        myInfoMenu(bot);
        resetBalanceEveryMonth();
        deleteOrderAndReturnBackToSaleProxy();
        await bot.start();
    } catch (error) {
        console.error(error);
    }
};

bot.catch((err) => {
  console.error("💥 Bot error:", err);
  if ("ctx" in err) {
    console.error("Context update:", err.ctx.update);
  }
});


start();