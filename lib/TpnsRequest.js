const crypto = require('crypto');
const https = require('https');
const HttpsProxyAgent = require('https-proxy-agent');
function signBody(accessId, secretKey, timeStamp, body){
    let hmac = crypto.createHmac('sha256', secretKey);
    let text = timeStamp + accessId + body;
    hmac.update(text);
    let buffer = Buffer.from(hmac.digest('hex'), 'ascii');
    let sign = buffer.toString('base64')
    return sign
}
/**
 * 请求TPNS数据
 * @param {string} accessId accessId
 * @param {string} secretKey secretKey
 * @param {string} host host，如 https://api.tpns.tencent.com
 * @param {string} api api路径，如 /v3/push/app
 * @param {object} body 请求体，可以json化的对象
 * @param {number} [timeout=5000] 连接超时时间
 * @param {string} [agent=undefined] 可选代理
 * @returns {Promise<object>} 服务器响应
 */
function tpnsRequest(accessId, secretKey, host, api, body, timeout=3000, agent=undefined){
    let bodyString = JSON.stringify(body);
    let time = Math.round(new Date().getTime()/1000).toString();
    let sign = signBody(accessId, secretKey, time, bodyString);
    let header = {
        "Content-Type": "application/json",
        "AccessId": accessId,
        "TimeStamp": time,
        "Sign": sign,
    };
    let options = {
        method: 'POST',
        timeout: timeout,
        headers: header,
    }
    // proxy
    if (agent != undefined){
        let proxyUrl = new URL(agent);
        let httpsAgent = new HttpsProxyAgent({
            protocol: proxyUrl.protocol,
            host: proxyUrl.hostname,
            port: proxyUrl.port,
        });
        options.agent = httpsAgent;
    }
    let url = new URL(api,host);
    return new Promise((resolve,reject)=>{
        let req = https.request(url, options, (res) => {
            let recData = '';
            res.on('data', (chunk) => {
                recData += chunk;
            });
            res.on('end', ()=>{
                resolve(JSON.parse(recData));
            })
        });
        req.on('timeout',()=>{
            req.destroy();
        })
        req.on('error',(err)=>{
            reject(err);
        })
        req.end(bodyString);
    });
}

class TpnsApi{
    accessId;
    secretKey;
    host;
    timeout;
    proxy;
    /**
     * 构造API请求工具 对象
     * @param {string} accessId accessId
     * @param {string} secretKey secretKey
     * @param {string} host host
     * @param {number} [timeout=3000] timeout
     * @param {string} [proxy=undefined] proxy
     */
    constructor(accessId, secretKey, host, timeout=3000, proxy=undefined){
        this.accessId = accessId;
        this.secretKey = secretKey;
        this.host = host;
        this.timeout = timeout;
        this.proxy = proxy;
    }
    /**
     * 请求API
     * @param {string} api 接口路径
     * @param {object} data 请求体
     * @returns {Promise<objecr>} 响应体
     */
    request(api, data){
        return tpnsRequest(this.accessId, this.secretKey, this.host, api, data, this.timeout, this.proxy);
    }
}

module.exports.TpnsApi = TpnsApi;
module.exports.tpnsRequest = tpnsRequest;
