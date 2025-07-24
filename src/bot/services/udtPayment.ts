import { TronWeb } from "tronweb";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.resolve('../../.env')});

const api = process.env.api_trcgrid;
if(!api){
  throw new Error('missing tronn GRID API');
}

const tronWeb = new TronWeb({
  fullHost: 'https://api.trongrid.io',
  headers: {
    'TRON-PRO-API-KEY': `${api}`,
    'Content-Type': 'application/json'
  },
  eventServer: 'https://api.trongrid.io',
  privateKey: ''
});

interface TronWallet {
  address: string;
  privateKey: string;
}

export async function generateWallet(): Promise<TronWallet | undefined> {
  try {
    const account = await tronWeb.createAccount();
    return {
      address: account.address.base58,
      privateKey: account.privateKey
    };
  } catch (error) {
    console.error('Error generating wallet:', error instanceof Error ? error.message : error);
    return undefined;
  }
}

const USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';

export async function getUSDTbalance(address: string): Promise<number | undefined> {
  try {
    if (!tronWeb.isAddress(address)) {
      console.error('Invalid TRON address:', address);
      return undefined;
    }

    const accountInfo = await tronWeb.trx.getAccount(address);
    
    if (accountInfo?.assetV2?.length) {
      const usdtAsset = accountInfo.assetV2.find(
        (asset: any) => asset.key === USDT_CONTRACT
      );
      if (usdtAsset) {
        return Number(usdtAsset.value) / 1e6;
      }
    }
    
    return 0; // No USDT balance found
  } catch (error) {
    console.error('Error fetching USDT balance:', {
      address: address,
      error: error instanceof Error ? error.message : error
    });
    return undefined;
  }
}

// Verify connection
async function checkConnection() {
  try {
    const block = await tronWeb.trx.getCurrentBlock();
    console.log('✅ TRON connection successful. Latest block:', block.block_header.raw_data.number);
  } catch (error) {
    console.error('TRON connection error:', error instanceof Error ? error.message : error);
  }
}

checkConnection();