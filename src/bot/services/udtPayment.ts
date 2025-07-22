import { TronWeb } from "tronweb";

const tronWeb = new TronWeb({
    fullHost:'https://api.trongrid.io'
})


const usdtContract = '';

interface tronWallet{
    address:string;
    privateKey:string;
}

export async function generateWallet():Promise<tronWallet|undefined>{
    try {
        const account = await tronWeb.createAccount();
        return {
            address:account.address.base58,
            privateKey:account.privateKey
        }
    } catch (error) {
        console.error(error);
    }
};

export async function getUSDTbalance(address:string):Promise<number|undefined>{
    try {
        const contract = await tronWeb.contract().at(usdtContract);
        const balanceRaw = await contract.methods.balanceOf(address).call();
        return Number(balanceRaw)/ 1e6;
    } catch (error) {
        console.error(error);
    }
}