const w3 = require('web3')
const TelegramBot = require('node-telegram-bot-api');
const token = ''; // PUT YOUR TOKENS HERE
const web3 = new w3(new w3.providers.WebsocketProvider('ws://127.0.0.1:8546')); //PUT YOUR WEBSOCKET HERE
const bot = new TelegramBot(token, {polling: true});
const fs = require('fs');

const subscription =  web3.eth.subscribe('pendingTransactions', async (err, res) => {
    try{
        var found = false
        var stats = ""
        var data = []
        const info = await web3.eth.getTransaction(res)
            if(info == null){
                return ;
            }
        var datas = await getData()
        datas.forEach(element => {
            var from = info["from"].toLowerCase()
            var to = info["to"].toLowerCase()
            var input = info["input"].substring(0, 10)
            var hash = info["hash"]
            var label = element["label"]
            var chatid = element["chatid"]
            if(from == element["address"].toLowerCase() && chatid == element["chatid"]){
                console.log("Found sir")
                data.push(from,to,input,hash,label,chatid)
                console.log(data)
                stats = "from"
                found = true
            } else if(to == element["address"].toLowerCase() && chatid == element["chatid"]){
                console.log("Found sir")
                data.push(from,to,input,hash,label,chatid)
                console.log(data)
                stats = "to"
                found = true
            }
            // console.log(info)
        });
        if(found == true){
            if(stats == "to"){
                await bot.sendMessage(data[5], `[!] INFO DANA MASUK🔔\nFrom: ${data[0]}\nTo: ${data[1]} ( ${data[4]} )\n\nTxHash: ${data[3]}`);
            } else if(stats == "from"){
                console.log(`[!] INFO New trx🔔\nFrom: ${data[0]} ( ${data[4]} ) \nTo: ${data[1]}\nInput:${data[2]}\n\nTxHash: ${data[3]}`)
                await bot.sendMessage(data[5], `[!] INFO New trx🔔\nFrom: ${data[0]} ( ${data[4]} ) \nTo: ${data[1]}\nInput:${data[2]}\n\nTxHash: ${data[3]}`);
            }
            found = false
            stats = ""
        }
    }catch(e){
    }
})
bot.onText(/\/monitor(.*?)\/|\/(.*?)/, async(msg, match) => {
    var data = {}
    data.Info = []
    if(match["input"].includes("monitor")){
        const find = match["input"]
    const str = find.split("|")
    const chatId = msg.chat.id;
    let addr = str[0]; // the captured "whatever"
    addr = addr.replace("/monitor ","")
    let label = str[1]; // the captured "whatever"
    if(label == null || label == '' || label == undefined){
        label = str[1];
    }
    if(addr.length < 41){
        bot.sendMessage(chatId, "[!] WRONG INPUT ADDRESS");
    return ;
    }
    const getDatas = await getData()
    getDatas.forEach(element => {
        var obj = {
            "address": element["address"].toLowerCase(),
            "label" : element["label"],
            "chatid": element["chatid"]
        }
        data.Info.push(obj)
        fs.writeFileSync("./address.json", JSON.stringify(data,null,4));
    });
    var obj = {
        "address":addr.toLowerCase(),
        "label":label,
        "chatid":chatId
    }
    data.Info.push(obj)
    fs.writeFileSync("./address.json", JSON.stringify(data,null,4))
    await bot.sendMessage(chatId, "[+] Saved 📑\nAddress: "+ addr+"\nLabel: "+label);
    }
});
async function getData(){
    var json = JSON.parse(fs.readFileSync('./address.json', 'utf8'));
    return json.Info
}
