export const isCoinsListUpdated = (coinsList: Array<Record<string, string>>, newCoinsList: Array<Record<string, string>>): boolean => {
    return coinsList.length !== newCoinsList.length
}
