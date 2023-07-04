import { TelegramBot } from "./bots/Bot";
import sqlite3 from 'sqlite3';
import { Coin, CoinData, CoinGeckoNotifier } from "./watcher/GeckoWatcher";
import { CoinCapNotifier } from "./watcher/CoinCapWatcher";



const botInit = async () => {
  // Usage:
  const db = new sqlite3.Database(':memory:'); // Replace with your actual database configuration
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    username TEXT
  )`);
  });

  const bot = new TelegramBot(db);
  bot.start();

  // Usage:
  const geckoNotifier = new CoinGeckoNotifier();

  geckoNotifier.on('initialized', (coins: CoinData) => {
    console.log('Initialized with coins:', coins);
  });

  geckoNotifier.on('newCoins', (newCoins: Coin[]) => {
    console.log('New coins detected on coin gecko:', newCoins);
    bot.sendNewCoinNotification(newCoins)
  });

  geckoNotifier.initialize();


  // Example usage
  const coinCapNotifier = new CoinCapNotifier();

  coinCapNotifier.on('newCoins', (newCoins: Coin[]) => {
    console.log('New coins detected on coin cap:', newCoins);
    bot.sendNewCoinNotification(newCoins)
  });

  coinCapNotifier.startPolling(5000); // Poll every 5 minutes (300,000 milliseconds)


};

botInit();
