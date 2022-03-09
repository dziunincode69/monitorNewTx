const w3 = require('web3')
const TelegramBot = require('node-telegram-bot-api');
const token = ''; // PUT YOUR TOKENS HERE
const web3 = new w3(new w3.providers.WebsocketProvider('ws://127.0.0.1:8546')); //PUT YOUR WEBSOCKET HERE
const bot = new TelegramBot(token, {polling: true});
const fs = require('fs');
const JFile = require('jfile')


    bot.onText(/\/monitor (.*?)\/|\/(.*?)/, (msg, match) => {
        (async () => {
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
                await bot.sendMessage(chatId, "[!] WRONG INPUT ADDRESS");
                return ;
            }
           const data = addr+"|"+label+"\n"
            // console.log(label)
            fs.appendFile("addrList.txt", data, (err) => {
                if (err)
                  console.log(err);
                else {
                }
              });
 
             await bot.sendMessage(chatId, "[+] Saved 📑\nAddress: "+ addr+"\nLabel: "+label);
            // console.log(myFile.grep("0x",true))
            const subscription =  web3.eth.subscribe('pendingTransactions', async (err, res) => {
                if (err) console.error(err);
                let txInfo =  await web3.eth.getTransaction(res);
                if(txInfo == null){
                    return ;
                }
                var myFile=new JFile("addrList.txt");
                const grep = myFile.grep(txInfo['from'], false)
                if(grep[0] == null){
                    return ;
                } else {
                    const name = grep[0].split("|")
                    await bot.sendMessage(chatId, "[!] Info 🔔\nAddress: "+ name[0]+"\nLabel: "+name[1]+"\nHas create new Tx:"+res);
                }
            })
        })()
      });

