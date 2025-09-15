import express,{ type Application,type Request,type Response,type NextFunction } from "express";
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import MongoStore from 'connect-mongo'
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import {loginRouter} from './routes/loginRoute';
import { updateRouter } from "./routes/updatePasswordRoute";
import {productRouter} from './routes/productRoute';
import {userRouter} from './routes/userRoute';
import {incomeStatistic} from './routes/monthIncomeRoute';
import methodOverride from 'method-override';
import {logoutRoute} from './routes/logoutRoute';
import {sendMsgRoute} from './routes/sendMessageRoute';
import https from 'https';
import fs from 'fs';


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



const options = {
    key: fs.readFileSync(path.join(__dirname, '../../key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../../cert.pem'))
};

app.use(helmet({
    hsts:false
}));

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

app.use(express.static(path.join(__dirname,'../../',"public")))

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'../../','views'));
app.use(methodOverride('_method'));


app.use('/auth',loginRouter);
app.use('/admin',updateRouter);
app.use('/admin',productRouter);
app.use('/admin',userRouter);
app.use('/admin',incomeStatistic);
app.use('/admin',logoutRoute);
app.use('/admin',sendMsgRoute);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

app.use((req:Request,res:Response,next:NextFunction)=>{
    res.status(404).json({ message: `Route ${req.originalUrl} not found.` });
});

export const startAdminPanel = async()=>{
    try {
        https.createServer(options, app).listen(3000, () => {
            console.log("Admin Panel running with HTTPS on port 3000");
        });

    } catch (error) {
        console.error(error);
    }
};


