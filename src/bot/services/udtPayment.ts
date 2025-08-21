import { TronWeb } from "tronweb";
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({path:path.resolve(__dirname,'../../../.env')});

const api = process.env.api_trcgrid;
if(!api){
  throw new Error('missing tron GRID API');
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

    const contract = await tronWeb.contract().at(USDT_CONTRACT);
    const balance = await contract.balanceOf(address).call({
      from:address
    });
    
    return Number(balance.toString())/1e6;
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

const usdtaddress = 'TD4xoEeXnEGPdLNwcTrQfVsybuUyc5BePW'

getUSDTbalance(usdtaddress).then(res=>console.log(res)).catch(err=>console.error(err));