import  config from "../config";
import TelegramBot = require("node-telegram-bot-api");
import _ = require("lodash");
import { isArrayOfCoinsUpdated } from "./utils";
import "reflect-metadata";
import axios from "axios";

class CoinCapBot {
  public coinsList: Array<Record<any, any>>;
  public users: Array<string>;
  private bot: any;

  constructor(coins: Array<Record<any, any>>) {
    if (typeof coins === "undefined") {
      throw new Error("Cannot be called directly");
    }
    this.bot = new TelegramBot(config.whadar_bot, { polling: true });
    this.coinsList = coins;
    this.users = config.users
  }

  static async asyncBuild() {
    return axios
      .get(config.coinCapNewList, {
        headers: {
          "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
        },
      })
      .then((res: any) => {
        return new CoinCapBot(res.data.data);
      });
  }

  async startCoinCapBot() {
    try {
      this.bot.onText(/\Hermanto Kovalsky/, (msg: any) => {
        const chatId = msg.chat.id;
        this.users.push(chatId);
        console.log({event: "user", status: "done", message: `User registered in Coin Market Cap Bot ${JSON.stringify(msg.chat)}`,});
        this.bot.sendMessage(chatId, "Зарегался, жди апдейта.");
      });
      console.log({event: "bot init", status: "done", message: "Coin Market Cap Bot initialized"});
    } catch (e) {
      console.error({event: "bot init", status: "info", message: "Coin Market Cap Bot initialisation failed"});
    }
    setInterval(async () => {
      if (!this.users.length) {
        console.error({event: "user", status: "info", message: "No one registered in coin market cap bot"});
        return;
      }
      const newCoins = await this.getNewCoins();
      if (!newCoins) {
        return;
      }
      for (let i = 0; i < this.users.length; i++) {
        await this.sendMessage(this.users[i], newCoins);
      }
    }, 10000);
  }

  private async getNewCoins(): Promise<void | Array<Record<any, any>>> {
    try {
      const updatedCoinsList = (await this.getCoinsList())
      if (!updatedCoinsList) {
        throw new Error('Coins list request from coin market cap failed')
      }
      const isDifferent = isArrayOfCoinsUpdated(
        updatedCoinsList.data,
        this.coinsList
      );
      console.log(`COINCAP ${updatedCoinsList.data.length}, ${this.coinsList.length}`)
      if (!isDifferent) {
        throw new Error("No new coins on coin market cap yet ")
      }
      const newCoins = _.differenceBy(updatedCoinsList.data, this.coinsList, "id");
      console.log({event: "new coins", status: "done", message: `found new coins: ${newCoins}, on coin market cap`,});
      this.coinsList = updatedCoinsList.data;
      return newCoins;
    } catch (e: any) {
      console.error({event: "new coins", status: "failed", message: e.message,});
    }
  }

  private async getCoinsList(): Promise<Record<any, any> | void> {
    try {
      const data = (
        await axios.get(config.coinCapNewList, {
          headers: {
            "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
          },
        })
      ).data as Record<any, any>;
      console.log({event: "coins", status: "done", message: "coins list received from coin market cap"});
      return data;
    } catch (e) {
      console.error({event: "coins", status: "failed", message: "coins list request from coin market cap failed"});
    }
  }



  private async getCoinInfo(coinId: any): Promise<any> {
    try {
      const data = (
        await axios(
          `https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${coinId}`,
          {
            headers: {
              "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
            },
          }
        )
      ).data as CoinInfo;
      console.log({event: "coin info", status: "done", message: "coin's info received"});
      return data.data;
    } catch (e) {
      console.error({event: "coin info", status: "failed", message: "coin's info request failed"});
    }
  }

  private async sendMessage(user: any, coin: any): Promise<void> {
    try {
      let coins = coin

      if (!Array.isArray(coins)) {
        coins = [coin]
      }
      for (let i = 0; i < coins.length; i++) {
        const coinInfo: any = await this.getCoinInfo(coins[i].id);
        let name = coinInfo[coins[i].id].name
        let website = coinInfo[coins[i].id].urls.website
        if (Array.isArray(website)) {
          website = website.map(el => el + "," + " ")
        } else {
          website = website[0]
        }
        if (!coinInfo) {
          throw new Error("info request failed");
        }
        const message = `<pre>
                          Name: ${name}
                          Link: ${website}
                         </pre>`;
        await this.bot.sendMessage(user, message, { parse_mode: "HTML" });
        console.log({ event: "message", status: "done", message });
      }
    } catch (e: any) {
      console.error({ event: "message", status: "failed", message: e.message });
      return;
    }
  }

}

interface CoinInfo { 
  status: Record<any, any>
  data: Record<any, any>
}

export default CoinCapBot;
