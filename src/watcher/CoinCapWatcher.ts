import axios, { AxiosResponse } from 'axios';
import EventEmitter from 'events';



interface Coin {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string | null;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
}

interface CoinInfo {
    id: string;
    rank: string;
    symbol: string;
    name: string;
    supply: string;
    maxSupply: string | null;
    marketCapUsd: string;
    volumeUsd24Hr: string;
    priceUsd: string;
    changePercent24Hr: string;
    vwap24Hr: string;
    // Add any additional properties specific to the coin info
}


export class CoinCapNotifier extends EventEmitter {
    private currentCoins: string[] = [];

    public async startPolling(interval: number): Promise<void> {
        console.log('Initializing CoinCapNotifier...');

        try {
            this.currentCoins = await this.fetchCoins();

            setInterval(async () => {
                try {
                    const coins = await this.fetchCoins();
                    this.compareCoins(coins);
                    this.currentCoins = coins;
                } catch (error: any) {
                    console.error('Error fetching coins:', error.message);
                }
            }, interval);

            console.log('CoinCapNotifier started successfully.');
        } catch (error: any) {
            console.error('Failed to initialize CoinCapNotifier:', error.message);
        }
    }

    private async fetchCoins(): Promise<string[]> {
        console.log('Fetching coins...');

        try {
            const headers = {
                'X-CMC_PRO_API_KEY': 'apikey', // Replace YOUR_API_KEY with your actual API key
            };

            const response: AxiosResponse<{ data: Coin[] }> = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/map`, {
                headers,
            });

            const coins: string[] = response.data.data.map((coin) => coin.id);
            console.log('Coins from coic cap fetched successfully.');
            return coins;
        } catch (error: any) {
            console.error('Failed to fetch coins:', error.message);
            throw error;
        }
    }


    private async compareCoins(updatedCoins: string[]): Promise<void> {
        const newCoins = updatedCoins.filter((coin) => !this.currentCoins.includes(coin));

        if (newCoins.length > 0) {
            for (const coin of newCoins) {
                try {
                    const response: AxiosResponse<{ data: CoinInfo }> = await axios.get(`https://pro-api.coinmarketcap.com/v1/cryptocurrency/info?id=${coin}`, {
                        headers: {
                            'X-CMC_PRO_API_KEY': 'apikey', // Replace YOUR_API_KEY with your actual API key
                        },
                    });
                    const coinInfo: CoinInfo = response.data.data;
                    console.log('Coin info:', coinInfo);
                    this.emit('newCoins', coinInfo);
                    // Perform actions with coin info
                } catch (error: any) {
                    console.error(`Failed to fetch information for coin ${coin}:`, error.message);
                }
            }
        }

        if (newCoins.length > 0) {
            this.currentCoins = updatedCoins;
        }
    }


}

