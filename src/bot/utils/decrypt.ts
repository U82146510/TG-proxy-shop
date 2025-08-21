import crypto from 'crypto';
import { fileURLToPath } from "url";
import path from "path";
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path:path.resolve(__dirname,'../../../.env')
});

export async function decryptKey(encryptedData: string): Promise<string> {
    try {
        const algorithm = 'aes-256-cbc';
        const secretKey = process.env.encryptionKey;
        
        if (!secretKey) {
            throw new Error('Missing encryption key in environment variables');
        }

  
        const keyBuffer = Buffer.from(secretKey, 'hex');
        if (keyBuffer.length !== 32) {
            throw new Error('Encryption key must be 32 bytes (64 hex characters)');
        }

 
        const parts = encryptedData.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid encrypted data format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const encryptedText = parts[1];


        const decipher = crypto.createDecipheriv(algorithm, keyBuffer, iv);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt data');
    }
}


const key='a9ceefe789cf9c7115ecd49dd490daf7:bdabe0be7acdabfd597551c4e1ec2c986040e9886eaf9812d1a4cf543ec2d21aa3a9037954267c4d32c22872748fbb53535e26c4d03de4295f0039047f4ac7442fd5447d02285612c184a54f36552a3b'

decryptKey(key).then(res=>console.log(res)).catch(err=>console.error(err))