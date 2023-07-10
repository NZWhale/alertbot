import EventEmitter from 'events';
import axios from 'axios';

export interface Coin {
  id: string;
  name: string;
  symbol: string;
}

interface CoinData {
  [coinId: string]: Coin;
}

export class CoinGeckoNotifier extends EventEmitter {
  private coins: CoinData = {};

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    console.log(`[${new Date().toISOString()}] Initializing CoinGeckoNotifier...`);
    await this.fetchCoins();
    console.log(`[${new Date().toISOString()}] Coins fetched and saved.`);
    this.emit('initialized', this.coins);
    setInterval(() => this.checkForUpdates(), 60000); // Every 5 minutes
  }

  async fetchCoins(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Fetching coins from the CoinGecko API...`);
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
      const coins = response.data as Coin[];
      this.coins = coins.reduce((data: CoinData, coin: Coin) => {
        data[coin.id] = coin;
        return data;
      }, {});
      console.log(`[${new Date().toISOString()}] Coins fetched successfully from coin gecko.`);
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to fetch coins from coin gecko:`, error.message);
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      console.log(`[${new Date().toISOString()}] Checking for updates from the CoinGecko API...`);
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
      const updatedCoins = response.data as Coin[];
      const newCoins: Coin[] = [];

      for (const coin of updatedCoins) {
        if (!this.coins[coin.id]) {
          const newCoin = await this.getCoinInfo(coin.id)
          newCoins.push(newCoin);
          this.coins[coin.id] = coin;
        }
      }

      if (newCoins.length > 0) {
        console.log(`[${new Date().toISOString()}] New coins detected on coin gecko:`, newCoins);
        this.emit('newCoins', newCoins);
      } else {
        console.log(`[${new Date().toISOString()}] No new coins detected on coin gecko.`);
      }
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Failed to check for updates on coin gecko:`, error.message);
    }
  }

  private async getCoinInfo(coinId: any): Promise<any> {
    try {
      const data = (
        await axios(`https://api.coingecko.com/api/v3/coins/${coinId}`)
      ).data;
      console.log(`[${new Date().toISOString()}]`, { event: "coin info", status: "done", message: "coin's info received", });
      return data;
    } catch (e) {
      console.error(`[${new Date().toISOString()}]`, { event: "coin info", status: "failed", message: "coin's info request failed", });
    }
  }
}



