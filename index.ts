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
        bot.sendMessage(chatId, 'Зарегался, жди апдейта. Если хочешь список всех коинов, пиши - Хочу монет')
    })

    bot.onText(/\Хочу монет/, (msg: any, match: any) => {
        const chatId = msg.chat.id
        users.push(chatId)
        bot.sendMessage(chatId, `${JSON.stringify(coinsList)}`)
    })

    setInterval(async () => {
            const updatedCoinsList = (await axios(coinsListUrl)).data as Array<Record<string, string>>
            const isListUpdated = isCoinsListUpdated(coinsList, updatedCoinsList)
            console.log(coinsList.length, updatedCoinsList.length)
            if(isListUpdated){
                const newCoin = _.differenceBy(updatedCoinsList, coinsList, 'id')[0]
                coinsList = updatedCoinsList
                console.log(`NEW COIN: ${JSON.stringify(newCoin)}`)
                if (users.length > 0) {
                    for (let i = 0; i < users.length; i++) {
                        bot.sendMessage(users[i], `name: ${newCoin.name}, symbol: ${newCoin.symbol}`)

                    }
                } else {
                    console.log('no user registered')
                }
            }
    }, 10000)

}

botInit()
