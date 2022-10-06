const w3 = require('web3')
const TelegramBot = require('node-telegram-bot-api');
const token = ''; // PUT YOUR TOKENS HERE
const web3 = new w3(new w3.providers.WebsocketProvider('ws://127.0.0.1:8546')); //PUT YOUR WEBSOCKET HERE
const bot = new TelegramBot(token, {polling: true});
const fs = require('fs');

const subscription =  web3.eth.subscribe('pendingTransactions', async (err, res) => {
    try{
        var found = false
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
                found = true
                var postData = {From:from,To:to,Input:input,Hash:hash,Label:label,Chatid:chatid, Stats:"from"}
                data.push(postData)   
         } else if(to == element["address"].toLowerCase() && chatid == element["chatid"]){
                console.log("Found sir")
               var postData = {From:from,To:to,Input:input,Hash:hash,Label:label,Chatid:chatid, Stats:"to"}
                data.push(postData)
                found = true
            }
        });
        if(found == true){
        await Promise.all(data.map(async (en) => {
        console.log(en["Chatid"])
        console.log("Status: " +en["Stats"])
        if(en["Stats"] == "to"){
      await bot.sendMessage(en["Chatid"], `[!] INFO DANA MASUK🔔\nFrom:${en["From"]}\nTo: ${en["To"]} ( ${en["Label"]} )\n\nTxHash: ${en["Hash"]}`);
           } else if(en["Stats"] == "from"){
              await bot.sendMessage(en["Chatid"], `[!] INFO New trx🔔\nFrom:${en["From"]} ( ${en["Label"]} ) \nTo: ${en["To"]}\nInput:${en["Input"]}\n\nTxHash: ${en["Hash"]}`);
        }
      }))
        found = false;
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
bot.onText(/\/del(.*?)\/|\/(.*?)/, async (msg, match) => {
    var data = {}
    data.Info = []
    if (match["input"].includes("del")) {
        try {
            const find = match["input"]
            let pisah = find.split(" ")
            const chatId = msg.chat.id;
            let identify = pisah[1].toLowerCase()
            let addr = identify // the captured "whatever"
            addr = addr.replace(" ", "")
            const getDatas = await getData()
            getDatas.forEach(element => {
                let hexx = element["address"].toLowerCase()
                let namee = element["label"].toLowerCase()
                let chatids = element["chatid"]
                if(addr.includes(hexx)){
                    console.log("found hexx")
                    hexx = "null"
                    namee = "null"
                    chatids = "null"
                } else if(addr.includes(namee)){
                    console.log("found namee")
                    hexx = "null"
                    namee = "null"
                    chatids = "null"
                }
                var obj = {
                    "address":hexx,
                    "label":namee,
                    "chatid":chatId
                }
                data.Info.push(obj)
                fs.writeFileSync("./address.json", JSON.stringify(data, null, 4));
            });
            bot.sendMessage(chatId, `Deleted ${addr}`, {
                parse_mode: 'Markdown'
            })
            console.log("Deleted "+identify)
        } catch (e) {
            bot.sendMessage(msg.chat.id, `Err found ${e.message}`, {
            })
        }

    }
})
async function getData(){
    var json = JSON.parse(fs.readFileSync('./address.json', 'utf8'));
    return json.Info
}
