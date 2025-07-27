import express,{ type Application } from "express";
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import {loginRouter} from './routes/loginRoute.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.resolve(__dirname,'../../.env')});
const connect_db = process.env.atlas;
if(!connect_db){
    throw new Error('missing atlas connection in the app.ts');
}

const secretKey = process.env.encryptionKey;
if(!secretKey){
    throw new Error('missing secret key ');
}

const app:Application = express();
const port:3000=3000;

app.use(helmet({
    hsts:false
}))

app.disable('x-powered-by');
app.disable('etag');
app.use(express.urlencoded({ extended: false }));

const limiter = rateLimit({
    windowMs:15*60*1000,
    max:100,
    message:'Too many requests, try again later.'
});
app.use(limiter);


app.use(
    session({
        name:'admin.sid',
        secret:secretKey,
        resave:false,
        saveUninitialized:false,
        store:MongoStore.create({
            mongoUrl:connect_db,
            ttl:60*60
        }),
        cookie:{
            httpOnly:true,
            secure:false,
            sameSite:'lax',
            maxAge:1000*60*60
        }
    })
);

app.use('/auth',loginRouter)

export const startAdminPanel = async()=>{
    try {
        app.listen(port,()=>console.info('Server ON'));
    } catch (error) {
        console.error(error);
    }
};

