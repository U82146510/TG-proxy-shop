import 'express-session';
import { Request } from 'express';
declare module 'express-session'{
    interface SessionData{
        userId:string;
    }
}
declare module 'express-serve-static-core'{
    interface Request{
        session:SessionData
    }
}