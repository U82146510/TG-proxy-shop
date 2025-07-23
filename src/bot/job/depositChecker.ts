import cron from 'node-cron';
import { checkForDeposits } from '../services/depositChecker.ts';
import { Bot} from "grammy";
export function startDepositChecker(bot:Bot){
    cron.schedule('*/30 * * * * *', async () => {
        console.log('⏰ Checking for USDT deposits...');
        await checkForDeposits(bot);
    });   
}