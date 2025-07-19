import mongoose from "mongoose";
import dotnev from 'dotenv';
import { fileURLToPath } from "url";
import path from "path";
import { error, log } from "console";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotnev.config({
    path:path.resolve(__dirname,"../../.env")
});

const connection_string = process.env.atlas;

if(!connection_string){
    throw new Error("missing connection string");
}

export const connect_db = async()=>{
    try {
        await mongoose.connect(connection_string,{
            serverSelectionTimeoutMS:5000,
            socketTimeoutMS:30000,
            maxPoolSize:50,
            minPoolSize:5,
            retryWrites:true,
            retryReads:true,
            connectTimeoutMS:10000,
            heartbeatFrequencyMS:30000,
            tls:true,
            tlsAllowInvalidCertificates:false,
            bufferCommands:false,
            waitQueueTimeoutMS:10000,
        });
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

const db:mongoose.Connection=mongoose.connection;
db.on('error',()=>{
    console.error(error)
})
.on('connected',()=>{
    console.info('db connected');
})
.on('disconnected',()=>{
    console.info('db disconnected');
})
.on('reconnected',()=>{
    console.info('db reconnected')
});

process.on('SIGINT',async()=>{
    await db.close();
    process.exit(0);
});