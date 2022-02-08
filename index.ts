
import GeckoBot from "./src/geckobot";
import CoinCapBot from "./src/coincapbot";

const botInit = async () => {
  const geckoBot = await GeckoBot.asyncBuild();
  // const coinCapBot = await CoinCapBot.asyncBuild();
  geckoBot.startGeckoBot();
  // coinCapBot.startCoinCapBot();
};

botInit();
