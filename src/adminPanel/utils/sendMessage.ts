import {Bot,Context} from 'grammy';


export async function sendMsg(bot:Bot<Context>,id:string,message:string):Promise<null|Error>{
    try {
        await bot.api.sendMessage(id,message);
        return null 
    } catch (error) {
        console.error(`Error at sending message to telegram id:${id}`,error);
        return error as Error;
    }
};