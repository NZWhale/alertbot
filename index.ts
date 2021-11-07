import axios from "axios";
import {coinsListUrl, token} from "./config";
import {isCoinsListUpdated} from "./src/isCoinsListUpdated";
const TelegramBot = require('node-telegram-bot-api')
const _ = require('lodash');


const botInit = async () => {

    let coinsList = (await axios(coinsListUrl)).data as Array<Record<any, any>>
    const bot = new TelegramBot(token, {polling: true})
    let users: any = []

    bot.onText(/\Hermanto Kovalsky/, (msg: any, match: any) => {
        const chatId = msg.chat.id
        users.push(chatId)
        console.log('user registered')
        bot.sendMessage(chatId, 'Зарегался, жди апдейта.')
    })



    setInterval(async () => {
            const updatedCoinsList = (await axios(coinsListUrl)).data as Array<Record<string, string>>
            const isListUpdated = isCoinsListUpdated(coinsList, updatedCoinsList)
            console.log(coinsList.length, updatedCoinsList.length)
            if(isListUpdated){
                const newCoin = _.differenceBy(updatedCoinsList, coinsList, 'id')[0]
                const coinInfo = (await axios(`https://api.coingecko.com/api/v3/coins/${newCoin.id}`)).data as CoinInfo
                const link = coinInfo.links.homepage[0]
                coinsList = updatedCoinsList
                console.log(`NEW COIN: ${JSON.stringify(newCoin)}`)
                if (users.length > 0) {
                    for (let i = 0; i < users.length; i++) {
                        bot.sendMessage(users[i], `${newCoin.name}, ${newCoin.symbol}, ${link}`)
                    }
                } else {
                    console.log('no user registered')
                }
            }
    }, 10000)

}

botInit()


interface CoinInfo {
    links: {
        homepage: Array<string>
    }
}
