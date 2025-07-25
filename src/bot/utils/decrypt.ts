import crypto from 'crypto';
import { fileURLToPath } from "url";
import path from "path";
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path:path.resolve(__dirname,'../../../.env')
});

export async function descryptKey(final:string){
    try {
        const algorithm = 'aes-256-cbc';
        const secretKey = process.env.encryptionKey;
        if(!secretKey){
            throw new Error('missing secret key');
        } 
        const [ivHex, encryptedData] = final.split(':');
        const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(ivHex, 'hex'));
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
    } catch (error) {
        console.error(error)
    }
}

