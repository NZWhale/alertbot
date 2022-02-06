import { coinsListUrl, whagnal_bot } from "../config";
import TelegramBot = require("node-telegram-bot-api");
import { isArrayOfCoinsUpdated } from "./utils";
import "reflect-metadata";
import _ = require("lodash");
import axios from "axios";

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

  static asyncBuild() {
    return axios(coinsListUrl).then((res: any) => {
      return new GeckoBot(res.data);
    });
  }

  async startGeckoBot() {
    try {
      this.bot.onText(/\Hermanto Kovalsky/, (msg: any, match: any) => {
        const chatId = msg.chat.id;
        this.users.push(chatId);
        console.log({
          event: "user",
          status: "done",
          message: `User registered in Coin Gecko Bot ${JSON.stringify(msg.chat)}`,
        });
        this.bot.sendMessage(chatId, "Зарегался, жди апдейта.");
      });
      console.log({
        event: "bot init",
        status: "done",
        message: "Gecko Bot initialized",
      });
    } catch (e) {
      console.error({
        event: "bot init",
        status: "failed",
        message: "Gecko Bot initialisation failed",
      });
    }
    setInterval(async () => {
      try {
        if (!this.users.length) {
          console.error({
            event: "user",
            status: "failed",
            message: "No one registered in Gecko Bot",
          });
          return;
        }
        const newCoins = await this.getNewCoins();
        if (!newCoins) {
          return;
        }
        for (let i = 0; i < this.users.length; i++) {
          await this.sendMessage(this.users[i], newCoins);
        }
      } catch (e) {}
    }, 10000);
  }

  private async getNewCoins(): Promise<void | Array<Record<any, any>>> {
    try{
      const updatedCoinsList = await this.getCoinsList();
      if(!updatedCoinsList){
        throw new Error('Coins list request from coin gecko failed')
      }
      const isDifferent = isArrayOfCoinsUpdated(updatedCoinsList, this.coinsList);
      if (!isDifferent) {
        throw new Error('No new coins yet on coin gecko')
      }
      const newCoins = _.differenceBy(updatedCoinsList, this.coinsList, "id");
      console.log({
        event: "new coins",
        status: "done",
        message: `found new coins: ${newCoins}, on coin gecko`,
      });
      this.coinsList = updatedCoinsList;
      return newCoins;
    }catch (e: any) {
      console.error({
        event: "new coins",
        status: "failed",
        message: e.message,
      });
    }
  }

  private async getCoinsList(): Promise<Array<Record<any, any>> | void> {
    try {
      const data = (await axios(coinsListUrl)).data as Array<Record<any, any>>;
      console.log({
        event: "coins",
        status: "done",
        message: "coins list received from Coin Gecko",
      });
      return data;
    } catch (e) {
      console.error({
        event: "coins",
        status: "failed",
        message: "coins list request from Coin Gecko failed",
      });
    }
  }

  private async getCoinInfo(coinId: any) {
    try {
      const data = (
        await axios(`https://api.coingecko.com/api/v3/coins/${coinId}`)
      ).data as CoinInfo;
      console.log({
        event: "coin info",
        status: "done",
        message: "coin's info received",
      });
      return data;
    } catch (e) {
      console.error({
        event: "coin info",
        status: "failed",
        message: "coin's info request failed",
      });
    }
  }

  private async sendMessage(user: any, coin: any): Promise<void> {
    try {
      const coinInfo = await this.getCoinInfo(coin.id);
      if(!coinInfo){
        throw new Error('info request failed')
      }
      const message = `<pre>🦎🦎🦎
Coin name: ${coinInfo.name}
Coin link: ${coinInfo.links.homepage}
</pre>`;
      await this.bot.sendMessage(user, message, { parse_mode: "HTML" });
      console.log({ event: "message", status: "done", message });
    } catch (e: any) {
      console.error({ event: "message", status: "failed", message: e.message });
      return;
    }
  }
}

interface CoinInfo {
  name: string;
  links: {
    homepage: Array<string>;
  };
}

export default GeckoBot;
