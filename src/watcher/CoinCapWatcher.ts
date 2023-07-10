import axios from 'axios';
import EventEmitter from 'events';

interface Coin {
    id: number,
    rank: number,
    name: string,
    symbol: string,
    slug: string,
    is_active: number,
    first_historical_data: string,
    last_historical_data: string,
    platform: string | null
}

// interface Coin {
//     id: string;
//     rank: string;
//     symbol: string;
//     name: string;
//     supply: string;
//     maxSupply: string | null;
//     marketCapUsd: string;
//     volumeUsd24Hr: string;
//     priceUsd: string;
//     changePercent24Hr: string;
//     vwap24Hr: string;
// }

interface CoinInfo {
    id: number;
    name: string;
    symbol: string;
    category: string;
    description: string;
    slug: string;
    logo: string;
    subreddit: string;
    notice: string;
    tags: string[];
    tagNames: string[];
    tagGroups: string[];
    urls: {
        website: string[];
        twitter: string[];
        messageBoard: string[];
        chat: string[];
        facebook: string[];
        explorer: string[];
        reddit: string[];
        technicalDoc: string[];
        sourceCode: string[];
        announcement: string[];
    };
    platform: null;
    dateAdded: string;
    twitterUsername: string;
    isHidden: number;
    dateLaunched: string;
    contractAddress: any[];
    selfReportedCirculatingSupply: null;
    selfReportedTags: null;
    selfReportedMarketCap: null;
    infiniteSupply: boolean;
}
interface CoinData {
    [coinId: string]: Coin;
}


export class CoinCapNotifier extends EventEmitter {
    private coins: CoinData = {};

    constructor() {
        super();
    }

    async initialize(timeout: number): Promise<void> {
        console.log(`[${new Date().toISOString()}] Initializing CoinCapNotifier...`);
        await this.fetchCoins();
        console.log(`[${new Date().toISOString()}] Coins fetched and saved.`);
        this.emit('initialized', this.coins);
        setInterval(() => this.checkForUpdates(), timeout); // Every 5 minutes
    }

    async fetchCoins(): Promise<void> {
        try {
            console.log(`[${new Date().toISOString()}] Fetching coins from the CoinGecko API...`);
            const headers = {
                'X-CMC_PRO_API_KEY': '11aee9f9-61fa-4e96-894f-fd4f9e9eb717', // Replace YOUR_API_KEY with your actual API key
            };
            const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map', { headers });
            const coins = response.data as {status: any, data: Coin[]};
            this.coins = coins.data.reduce((data: CoinData, coin: Coin) => {
                data[coin.id] = coin;
                return data;
            }, {});
            console.log(`[${new Date().toISOString()}] Coins fetched successfully from coin cap.`);
        } catch (error: any) {
            console.error(`[${new Date().toISOString()}] Failed to fetch coins from coin cap:`, error.message);
        }
    }

    async checkForUpdates(): Promise<void> {
        try {
            console.log(`[${new Date().toISOString()}] Checking for updates from the CoinCap API...`);
            const headers = {
                'X-CMC_PRO_API_KEY': '11aee9f9-61fa-4e96-894f-fd4f9e9eb717', // Replace YOUR_API_KEY with your actual API key
            };
            const response = (await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/map', { headers }));
            const updatedCoins = response.data as {status: any, data: Coin[]};
            const newCoins: CoinInfo[] = [];

            for (const coin of updatedCoins.data) {
                if (!this.coins[coin.id]) {
                    const newCoin = await this.getCoinInfo(coin.id)
                    if (!newCoin) {
                        continue
                    }
                    newCoins.push(newCoin);
                    this.coins[coin.id] = coin;
                }
            }

            if (newCoins.length > 0) {
                console.log(`[${new Date().toISOString()}] New coins detected on coin cap:`, newCoins);
                this.emit('newCoins', newCoins);
            } else {
                console.log(`[${new Date().toISOString()}] No new coins detected on coin cap.`);
            }
        } catch (error: any) {
            console.error(`[${new Date().toISOString()}] Failed to check for updates from coin cap:`, error.message);
        }
    }

    private async getCoinInfo(coinId: any): Promise<CoinInfo | undefined> {
        try {
            const headers = {
                'X-CMC_PRO_API_KEY': '11aee9f9-61fa-4e96-894f-fd4f9e9eb717', // Replace YOUR_API_KEY with your actual API key
            };
            const data = (
                await axios(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${coinId}`, { headers })
            ).data as unknown as CoinInfo;
            console.log(`[${new Date().toISOString()}]`, { event: "coin info", status: "done", message: "coin's info received from coin cap", });
            console.log(data)
            return data;
        } catch (e) {
            console.error(`[${new Date().toISOString()}]`, { event: "coin info", status: "failed", message: "coin's info request failed from coin cap", });
            return
        }
    }

}

