import { Bot } from "./bots/Bot";
import sqlite3 from 'sqlite3';
import { Coin, CoinGeckoNotifier } from "./watcher/GeckoWatcher";
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

  const bot = new Bot();
  bot.start();

  // Usage:
  const geckoNotifier = new CoinGeckoNotifier();

  geckoNotifier.on('initialized', (coins: any) => {
    console.log('Initialized with coins:', coins);
  });

  geckoNotifier.on('newCoins', (newCoins: Coin[]) => {
    console.log('New coins detected on coin gecko:', newCoins);
    bot.sendNewCoinNotification(newCoins, 'gecko')
  });

  geckoNotifier.initialize();


  // Example usage
  const coinCapNotifier = new CoinCapNotifier();

  coinCapNotifier.on('newCoins', (newCoins: Coin[]) => {
    console.log('New coins detected on coin cap:', newCoins);
    bot.sendNewCoinNotification(newCoins, 'coincap')
  });

  coinCapNotifier.initialize(87008); // Poll every 5 minutes (300,000 milliseconds)


};

botInit();
