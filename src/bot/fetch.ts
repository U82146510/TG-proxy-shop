export interface Proxy{
  eid:string,
  name:string,
  local_ip:string,
  admin_ip:string,
  proxy_exp:string,
  operator:string,
  number:string,
  props:string,
  status:string,
  canbuy:string,
  signal:string,
  comment:string,
  check_err_count:string,
  proxy_self:string,
  proxy_testing:string,
  local_server_ip:string,
  modem:string,
  checker:string,
}

const test = 'bb34976790defa6c149e56af35122bf7';

export async function getProxy(auth:string):Promise<Proxy[]|undefined>{
    const link:string = `https://mobileproxy.space/api.html?command=load_modems`;
    try {
        const response = await fetch(link,{
            method:'GET',
            headers:{
                'Authorization': `Bearer ${auth}`
            }
        });
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json() as Proxy[];
        const result:Proxy[]=data.filter(value=>value.canbuy==="1"&&value.check_err_count==="0"&&value.proxy_exp===null&&value.status==="1")
        console.log(result);
        return result;
    } catch (error) {
        console.error(error)
    }
};


