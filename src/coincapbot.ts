import { coinCapNewList, whadar_bot } from "../config";
import TelegramBot = require("node-telegram-bot-api");
import { isArrayOfCoinsUpdated } from "./utils";
import "reflect-metadata";
import _ = require("lodash");
import axios from "axios";

class CoinCapBot {
  public coinsList: Array<Record<any, any>>;
  public users: Array<string>;
  private bot: any;

  constructor(coins: Array<Record<any, any>>) {
    if (typeof coins === "undefined") {
      throw new Error("Cannot be called directly");
    }
    this.bot = new TelegramBot(whadar_bot, { polling: true });
    this.coinsList = coins;
    this.users = [];
  }

  static asyncBuild() {
    return axios
      .get(coinCapNewList, {
        headers: {
          "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
        },
      })
      .then((res: any) => {
        return new CoinCapBot(res.data.data);
      });
  }

  async startCoinCapBot() {
    this.bot.onText(/\Hermanto Kovalsky/, (msg: any, match: any) => {
      const chatId = msg.chat.id;
      this.users.push(chatId);
      console.log("user registered");
      this.bot.sendMessage(chatId, "Зарегался, жди апдейта.");
    });
    setInterval(async () => {
      if (!this.users.length) {
        console.error("No users authorized");
        return;
      }
      const newCoins = await this.getNewCoins();
      if (!newCoins) {
        console.error("No new coins yet");
        return;
      }
      for (let i = 0; i < this.users.length; i++) {
        await this.sendMessage(this.users[i], newCoins);
      }
    }, 10000);
  }

  private async getNewCoins(): Promise<boolean | Array<Record<any, any>>> {
    const updatedCoinsList = (await this.getCoinsList()).data;
    const isDifferent = isArrayOfCoinsUpdated(updatedCoinsList, this.coinsList);
    if (!isDifferent) {
      return false;
    }
    const newCoins = _.differenceBy(updatedCoinsList, this.coinsList, "id");
    this.coinsList = updatedCoinsList;
    return newCoins;
  }

  private async getCoinsList(): Promise<Record<any, any>> {
    return (await axios
        .get(coinCapNewList, {
            headers: {
                "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
            },
        })).data as Record<any, any>
  }

  private async getCoinInfo(coinId: any) {
    return (await axios(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info/${coinId}`, {
        headers: {
            "X-CMC_PRO_API_KEY": "585a162a-2517-4b7f-81a4-74b043a910b2",
        },
    }))
      .data as CoinInfo;
  }

  private async sendMessage(coin: any, user: any): Promise<void> {
    const coinInfo: any = await this.getCoinInfo(coin.id);
    const message = `<pre>
                            Coin name: ${coinInfo[coin.id].name}
                            Coin link: ${coinInfo.urls.website}
                     </pre>`;
    await this.bot.sendMessage(user, message);
  }
}

interface CoinInfo {
  urls: {
    website: string;
  };
}


export default CoinCapBot;
