import { format, addDays } from 'date-fns';

const currentExpireAt = new Date("Wed Aug 06 2025 19:51:52 GMT+0100");
const newExpireAt = addDays(currentExpireAt, 1);
const formattedDate = format(newExpireAt, 'yyyy-MM-dd HH:mm:ss');


export async function extendProxy(proxy_exp:string,proxy_id:string){
    const url =`https://mobileproxy.space/api.html?command=ext_self_proxy&proxy_id=${proxy_id}&proxy_exp=${proxy_exp}`;
    try {
        const response = await fetch(url,{
            method:"GET",
            headers:{'Authorization': 'Bearer bb34976790defa6c149e56af35122bf7'}
        });
        console.log(await response.json())
    } catch (error) {
        console.error(error);
    }
};

