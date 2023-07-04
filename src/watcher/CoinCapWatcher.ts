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
    private apiUrl = 'https://api.coincap.io/v2';
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
                } catch (error) {
                    console.error('Error fetching coins:', error);
                }
            }, interval);

            console.log('CoinCapNotifier started successfully.');
        } catch (error) {
            console.error('Failed to initialize CoinCapNotifier:', error);
        }
    }

    private async fetchCoins(): Promise<string[]> {
        console.log('Fetching coins...');

        try {
            const headers = {
                'Accept-Encoding': 'gzip, deflate',
                Authorization: 'Bearer 9c0225a8-8581-478c-887d-e13b63c2fe95', // Replace YOUR_API_KEY with your actual API key
            };

            const response: AxiosResponse<{ data: Coin[] }> = await axios.get(`${this.apiUrl}/assets`, {
                headers,
            });

            const coins: string[] = response.data.data.map((coin) => coin.symbol);
            console.log('Coins fetched successfully.');
            return coins;
        } catch (error) {
            console.error('Failed to fetch coins:', error);
            throw error;
        }
    }


    private async compareCoins(updatedCoins: string[]): Promise<void> {
        const newCoins = updatedCoins.filter((coin) => !this.currentCoins.includes(coin));

        if (newCoins.length > 0) {
            console.log('New coins:', newCoins);
            for (const coin of newCoins) {
                try {
                    const response: AxiosResponse<{ data: CoinInfo }> = await axios.get(`${this.apiUrl}/assets/${coin}`, {
                        headers: {
                            'Accept-Encoding': 'gzip, deflate',
                            Authorization: 'Bearer YOUR_API_KEY', // Replace YOUR_API_KEY with your actual API key
                        },
                    });
                    const coinInfo: CoinInfo = response.data.data;
                    console.log('Coin info:', coinInfo);
                    this.emit('newCoins', coinInfo);
                    // Perform actions with coin info
                } catch (error) {
                    console.error(`Failed to fetch information for coin ${coin}:`, error);
                }
            }
        }

        if (newCoins.length > 0) {
            this.currentCoins = updatedCoins;
        }
    }


}

