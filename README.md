# TpnsApi
Tencent Push Notification Service server-side api

## Example
```javascript
const TpnsApi = require("tpns-api").TpnsApi;

let api = new TpnsApi(
    "accessid", // accessid
    "secretkey", // secretkey
    "https://api.tpns.tencent.com/", // GuangZhou host
    // 1000, // timeout(ms)
    // 'http://127.0.0.1:1080' // proxy
);

api.request(
    "/v3/statistics/get_push_record",
    {
        "limit": 1,
        "msgType": "notify",
        "offset": 0
    }
).then((resp)=>{
    console.log(JSON.stringify(resp,undefined,2));
}).catch((err)=>{
    console.log("Oh NO!!!",err);
});
```