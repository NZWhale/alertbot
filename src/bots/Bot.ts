
import { Context } from 'telegraf/typings';



export class Bot {
    private bot: any;
    private users: Array<string> = ['148647918', '1194954773', '476046869']


    constructor() {
        const { Telegraf } = require('telegraf');
        this.bot = new Telegraf('botid');
        this.bot.start(this.handleStart.bind(this));
    }

    public start(): void {
        this.bot.launch();
    }

    private handleStart(ctx: Context): void {
        ctx.reply('Welcome! We are both here...');
    }


    public sendNewCoinNotification(coins: any[], exchange: string): void {
        for (const coin of coins) {
            for (const user of this.users) {
                if (exchange === 'gecko') {
                    const message =
                        `🦎🦎🦎
Name: ${coin.name}
Link: ${coin.links.homepage}`;
                    this.bot.telegram.sendMessage(user, message);
                }
                if (exchange === 'coincap') {
                    let name = coin.name
                    let website = coin.urls.website
                    if (Array.isArray(website)) {
                        website = website.reduce((prev, curr) => prev + `<a href="${curr}">${curr}</a>\n`, '')
                    } else {
                        website = website.replace(',', ' ').split(',').reduce((prev: string, curr: string) => prev + `<a href="${curr}">${curr}</a>\n`, '')
                    }
                    if (!coin) {
                        throw new Error("info request failed");
                    }
                    const message =
                        `Name: ${name}
Links: 
${website}`;
                    this.bot.telegram.sendMessage(user, message);

                }
            }
        }
    }
}
