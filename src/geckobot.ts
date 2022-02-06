import { coinsListUrl, whagnal_bot } from "../config";
import TelegramBot = require("node-telegram-bot-api");
import {isArrayOfCoinsUpdated} from "./utils";
import "reflect-metadata";
import _ = require("lodash");
import axios from "axios";

// @LogClass({
//   log,
//   logError,
// })
// @ts-ignore
class GeckoBot {
  public coinsList: Array<Record<any, any>>;
  public users: Array<string>;
  private bot: any;

  constructor(coins: Array<Record<any, any>>) {
    if (typeof coins === "undefined") {
      throw new Error("Cannot be called directly");
    }
    this.bot = new TelegramBot(whagnal_bot, { polling: true });
    this.coinsList = coins;
    this.users = [];
  }

  // @Log()
  // @ts-ignore
  static asyncBuild() {
    return axios(coinsListUrl)
      .then((res: any) => {
        return new GeckoBot(res.data);
      });
  }

  // @Log()
  // @ts-ignore
  async startGeckoBot() {
    this.bot.onText(/\Hermanto Kovalsky/, (msg: any, match: any) => {
      const chatId = msg.chat.id;
      this.users.push(chatId);
      console.log("user registered");
      this.bot.sendMessage(chatId, "Зарегался, жди апдейта.");
    });
    setInterval(async () => {
      if (!this.users.length) {
        console.error("No users authorized")
        return
      }
      const newCoins = await this.getNewCoins();
      if (!newCoins) {
        console.error("No new coins yet")
        return
      }
      for (let i = 0; i < this.users.length; i++) {
        await this.sendMessage(this.users[i], newCoins);
      }
    }, 10000);
  }

  private async getNewCoins(): Promise<boolean | Array<Record<any, any>>> {
    const updatedCoinsList = await this.getCoinsList();
    const isDifferent = isArrayOfCoinsUpdated(updatedCoinsList, this.coinsList)
    if (!isDifferent) {
      return false;
    }
    const newCoins = _.differenceBy(updatedCoinsList, this.coinsList, "id");
    this.coinsList = updatedCoinsList
    return newCoins
  }

  private async getCoinsList(): Promise<Array<Record<any, any>>> {
    return (await axios(coinsListUrl)).data as Array<Record<any, any>>;
  }

  // @Log()
  // @ts-ignore
  private awaitMessage(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.bot.onText(/\Hermanto Kovalsky/, (msg: any, match: any) => {
        if (!msg.chat.id) {
          reject(new Error("something goes wrong with registration"));
        }
        this.bot.sendMessage(msg.chat.id, "Зарегался, жди апдейта.");
        resolve({ userChatId: msg.chat.id });
        console.log("user registered", `{userChatId: ${msg.chat.id}}`);
      });
    });
  }

  // @Log()
  //@ts-ignore
  private async getCoinInfo(coinId) {
    return (await axios(`https://api.coingecko.com/api/v3/coins/${coinId}`))
      .data as CoinInfo;
  }

  // @Log()
  //@ts-ignore
  private async sendMessage(user, coin): Promise<void> {
    try{
      const coinInfo = await this.getCoinInfo(coin.id);
      const message = `<pre>
                            Coin name: ${coinInfo.name}
                            Coin link: ${coinInfo.links.homepage}
                     </pre>`;
      await this.bot.sendMessage(user, message);
    }catch (e: any) {
      console.error(e.message)
      return
    }

  }
}

interface CoinInfo {
  name: string
  links: {
    homepage: Array<string>;
  };
}



export default GeckoBot;
