interface proxyResponse{ status: string, pid: number, proxy_id: number }
interface proxyDetails{
  proxy_id: number,
  proxy_exp: string,
  proxy_login: string,
  proxy_pass: string,
  proxy_hostname: string,
  proxy_host_ip: string,
  proxy_independent_http_hostname: string,
  proxy_independent_http_host_ip: string,
  proxy_independent_socks5_hostname: string,
  proxy_independent_socks5_host_ip: string,
  proxy_independent_port: string,
  proxy_http_port: string,
  proxy_socks5_port: number,
  proxy_operator: string,
  proxy_geo: string,
  proxy_auto_renewal: string,
  proxy_reboot_time: number,
  proxy_ipauth: unknown,
  proxy_auto_change_equipment: string,
  proxy_change_ip_url: string,
  proxy_groups_name: unknown,
  proxy_key: string,
  eid: string,
  geoid: string,
  id_country: string,
  proxy_self: string,
  proxy_testing: string,
  proxy_comment: string,
  last_time_change_equipment: unknown
};


export async function fetchProxy(eid:string,proxy_comment:string,proxy_exp:string):Promise<proxyDetails|null>{
    await canBuyOff(eid);
    const encodedComment = encodeURIComponent(proxy_comment);
    const encodedExpire = encodeURIComponent(proxy_exp);
    const url:string =`https://mobileproxy.space/api.html?command=add_self_proxy&eid=${eid}&proxy_comment=${encodedComment}&proxy_exp=${encodedExpire}`;
    try {
        const response = await fetch(url,{
            method:"GET",
            headers:{'Authorization': 'Bearer bb34976790defa6c149e56af35122bf7'}
        });
        const data = await response.json() as proxyResponse;
        const loginDetails = await fetchProxyID(data.pid);
        return loginDetails;
    } catch (error) {
        console.error(error);
        return null
    }
};


async function fetchProxyID(id:number):Promise<proxyDetails|null>{
    const url = `https://mobileproxy.space/api.html?command=get_my_proxy&proxy_id=${id}`;
    try {
        const response = await fetch(url,{
            method:'GET',
            headers:{"Authorization": "Bearer bb34976790defa6c149e56af35122bf7"}
        });
        const data = await response.json();
        const proxyAllRelatedData:proxyDetails = data[0] as proxyDetails;
        await stopProxyAutoRenewal(proxyAllRelatedData.proxy_id);
        console.log(proxyAllRelatedData)
        return proxyAllRelatedData;
    } catch (error) {
        console.error(error);
        return null
    }
};


async function stopProxyAutoRenewal(id:number) {
    const url=`https://mobileproxy.space/api.html?command=edit_proxy&proxy_id=${id}&proxy_auto_renewal=0`;
    try {
        await fetch(url,{
            method:'GET',
            headers:{
                "Authorization": "Bearer bb34976790defa6c149e56af35122bf7"
            }
        });
    } catch (error) {
        console.error(error);
    }
};


export async function canBuyOff(eid:string,status:"0"|"1"="0") {
    const url = `https://mobileproxy.space/api.html?command=edit_modems&eid=${eid}&canbuy=${status}`;
    try {
        const response = await fetch(url,{
            method:"GET",
            headers:{'Authorization': 'Bearer bb34976790defa6c149e56af35122bf7'}
        });
        const data = await response.json();
        console.log(data)
    } catch (error) {
        console.error(error);
    }
};
