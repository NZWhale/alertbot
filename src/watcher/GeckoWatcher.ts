import EventEmitter from 'events';
import axios from 'axios';

export interface Coin {
  id: string;
  name: string;
  symbol: string;
}

export interface CoinData {
  [coinId: string]: Coin;
}

export class CoinGeckoNotifier extends EventEmitter {
  private coins: CoinData = {};

  constructor() {
    super();
  }

  async initialize(): Promise<void> {
    console.log('Initializing CoinGeckoNotifier...');
    await this.fetchCoins();
    console.log('Coins fetched and saved.');
    this.emit('initialized', this.coins);
    setInterval(() => this.checkForUpdates(), 10000); // Every 5 minutes
  }

  async fetchCoins(): Promise<void> {
    try {
      console.log('Fetching coins from the CoinGecko API...');
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
      const coins = response.data as Coin[];
      this.coins = coins.reduce((data: CoinData, coin: Coin) => {
        data[coin.id] = coin;
        return data;
      }, {});
      console.log('Coins fetched successfully.');
    } catch (error) {
      console.error('Failed to fetch coins:', error);
    }
  }

  async checkForUpdates(): Promise<void> {
    try {
      console.log('Checking for updates from the CoinGecko API...');
      const response = await axios.get('https://api.coingecko.com/api/v3/coins/list');
      const updatedCoins = response.data as Coin[];
      const newCoins: Coin[] = [];

      for (const coin of updatedCoins) {
        if (!this.coins[coin.id]) {
          newCoins.push(coin);
          this.coins[coin.id] = coin;
        }
      }

      if (newCoins.length > 0) {
        console.log('New coins detected:', newCoins);
        this.emit('newCoins', newCoins);
      } else {
        console.log('No new coins detected.');
      }
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  }
}

