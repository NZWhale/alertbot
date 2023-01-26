import _ = require("lodash");

export const isArrayOfCoinsUpdated = (coinsList: Array<Record<string, string>>, newCoinsList: Array<Record<string, string>>): boolean => {
    return coinsList.length !== newCoinsList.length
}

export const compareArrayOfCoins = (x: Array<Record<any, any>>, y: Array<Record<any, any>>): boolean => {
        return _(x).differenceWith(y, _.isEqual).isEmpty();
}



export const log = (message: string) => {
    console.log(message)
};
export const logError = (message: string) => {
    console.error(message)
};