
import GeckoBot from "./bots/geckobot";
import CoinCapBot from "./bots/coincapbot";

const botInit = async () => {
//   const geckoBot = await GeckoBot.asyncBuild();
//   const coinCapBot = await CoinCapBot.asyncBuild();
// geckoBot.startGeckoBot();
// coinCapBot.startCoinCapBot();
  const tbot = await TelegramBot.asyncBuild();
  const geckoWatcher = await GeckoWatcher.asyncBuild();
  const coinCapWatcher = await CoinCapWatcher.asyncBuild();
  tbot.start()
  geckoWatcher.on('new_coin', tbot.newCoin)
  coinCapWatcher.on('new_coin', tbot.newCoin)
};

botInit();
