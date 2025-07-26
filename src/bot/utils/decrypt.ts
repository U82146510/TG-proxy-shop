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