
import GeckoBot from "./bots/geckobot";
import CoinCapBot from "./bots/coincapbot";

const botInit = async () => {
  const geckoBot = await GeckoBot.asyncBuild();
  const coinCapBot = await CoinCapBot.asyncBuild();
  geckoBot.startGeckoBot();
  coinCapBot.startCoinCapBot();
};

botInit();
