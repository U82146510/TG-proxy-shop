import { createClient,type RedisClientType } from "redis";

type RedisConfig = {
    host:string;
    port:number;
    password?:string;
    maxRetries?:number;
    retryDelays:number;
};


class RedisClient {
    private client:RedisClientType;
    private config:RedisConfig;

    constructor(config:Partial<RedisConfig>={}){
        this.config = {
            host:'localhost',
            port:6379,
            maxRetries:5,
            retryDelays:5000,
            ...config
        };
        this.client = createClient({
            socket:{
                host:this.config.host,
                port:this.config.port,
                reconnectStrategy:(retries)=>{
                    if(retries>=5){
                        return new Error('Max retries reached')
                    }
                    return this.config.retryDelays
                }
            },
            password:this.config.password
        });
        this.setupEventListener();
    }
    private setupEventListener():void{
        this.client.on('connect',()=>{
            console.log('Redis connecting...');
        });
        this.client.on('ready',()=>{
            console.log('Redis connected and ready');
        });
        this.client.on('error',(error:Error)=>{
            console.error('Redis error',error)
        });
        this.client.on('end',()=>{
            console.log('Redis disconnected');
        });
        this.client.on('reconnecting',()=>{
            console.log('Redis reconnecting...');
        });
    }
    public async connect():Promise<void>{
        try {
            await this.client.connect();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Redis connection failed', { message: error.message, stack: error.stack });
            } else {
                console.error('Redis connection failed with unknown error:', error);
            }
            throw error;
        }
    }
    public async disconnect():Promise<void>{
        try {
            await this.client.quit();
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Redis disconnection failed', { message: error.message, stack: error.stack });
            } else {
                console.error('Redis disconnection failed with unknown error:', error);
            }
            throw error;
        }
    }
    public async set(key:string,value:string, options?:{ttl?:number}):Promise<void>{
        if(options?.ttl){
            await this.client.setEx(key,options.ttl,value);
        }else{
            await this.client.set(key,value);
        }
    }
    public async get(key:string):Promise<string|null>{
        return await this.client.get(key);
    }
    public async delete(key:string):Promise<boolean>{
        const result = await this.client.del(key);
        return result > 0;
    }
    public async exists(key:string):Promise<boolean>{
        const result = await this.client.exists(key);
        return result === 1;
    }
    public async getList(key: string): Promise<string[]> {
        return await this.client.lRange(key, 0, -1);
    }

    public async pushList(key: string, values: string[], ttlSeconds?: number): Promise<void> {
        await this.client.rPush(key, values);
        if (ttlSeconds) await this.client.expire(key, ttlSeconds);
    }

    public getClient():RedisClientType{
        return this.client;
    }
};

export const redis = new RedisClient();