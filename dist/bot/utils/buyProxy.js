"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchProxy = fetchProxy;
exports.canBuyOff = canBuyOff;
;
async function fetchProxy(eid, proxy_comment, proxy_exp) {
    await canBuyOff(eid);
    const encodedComment = encodeURIComponent(proxy_comment);
    const encodedExpire = encodeURIComponent(proxy_exp);
    const url = `https://mobileproxy.space/api.html?command=add_self_proxy&eid=${eid}&proxy_comment=${encodedComment}&proxy_exp=${encodedExpire}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { 'Authorization': 'Bearer bb34976790defa6c149e56af35122bf7' }
        });
        const data = await response.json();
        const loginDetails = await fetchProxyID(data.pid);
        return loginDetails;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
;
async function fetchProxyID(id) {
    const url = `https://mobileproxy.space/api.html?command=get_my_proxy&proxy_id=${id}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: { "Authorization": "Bearer bb34976790defa6c149e56af35122bf7" }
        });
        const data = await response.json();
        const proxyAllRelatedData = data[0];
        await stopProxyAutoRenewal(proxyAllRelatedData.proxy_id);
        console.log(proxyAllRelatedData);
        return proxyAllRelatedData;
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
;
async function stopProxyAutoRenewal(id) {
    const url = `https://mobileproxy.space/api.html?command=edit_proxy&proxy_id=${id}&proxy_auto_renewal=0`;
    try {
        await fetch(url, {
            method: 'GET',
            headers: {
                "Authorization": "Bearer bb34976790defa6c149e56af35122bf7"
            }
        });
    }
    catch (error) {
        console.error(error);
    }
}
;
async function canBuyOff(eid, status = "0") {
    const url = `https://mobileproxy.space/api.html?command=edit_modems&eid=${eid}&canbuy=${status}`;
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: { 'Authorization': 'Bearer bb34976790defa6c149e56af35122bf7' }
        });
        const data = await response.json();
        console.log(data);
    }
    catch (error) {
        console.error(error);
    }
}
;
