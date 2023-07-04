
import sqlite3 from 'sqlite3';
import Context from 'telegraf/typings/context';


interface User {
    userId: string;
    username: string;
}

interface DatabaseRow {
    id: number;
    userId: string;
    username: string;
}

export class Bot {
    private bot: any;
    private db: sqlite3.Database;
    private adminId: string;
    private users: Array<User> = []


    constructor(db: sqlite3.Database) {
        const { Telegraf } = require('telegraf');

        this.bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN');
        this.db = db;
        this.adminId = 'YOUR_ADMIN_USER_ID';
        this.bot.start(this.handleStart.bind(this));
        this.bot.hears('Add User', this.handleAddUser.bind(this));
        this.bot.hears('Remove User', this.handleRemoveUser.bind(this));
        this.bot.hears('Show Users', this.handleShowUsers.bind(this));
    }

    public start(): void {
        this.bot.launch();
    }

    private handleStart(ctx: Context): void {
        const userId = ctx.from?.id.toString();
        if (userId === this.adminId) {
            ctx.reply('Welcome, admin! Please choose an option:', {
                reply_markup: {
                    keyboard: [
                        ['Add User', 'Remove User'],
                        ['Show Users']
                    ],
                    one_time_keyboard: true,
                    resize_keyboard: true
                }
            });
        } else {
            ctx.reply('Welcome! This bot is for admin use only.');
        }
    }

    private async handleAddUser(ctx: Context): Promise<void> {
        if (ctx.from?.id.toString() === this.adminId) {
            const userId = ctx.from?.id.toString();
            const username = ctx.from?.username || '';
            await this.registerUser(userId, username);
            ctx.reply('User added successfully.');
        } else {
            ctx.reply('You are not authorized to register user.');
        }
    }

    private async handleRemoveUser(ctx: Context): Promise<void> {
        if (ctx.from?.id.toString() === this.adminId) {
            const userId = ctx.from?.id.toString();
            if (userId) {
                await this.removeUser(userId);
                ctx.reply('User removed successfully.');
            } else {
                ctx.reply('Failed to remove user.');
            }
        } else {
            ctx.reply('You are not authorized to remove users.');
        }
    }

    private async handleShowUsers(ctx: Context): Promise<void> {
        if (ctx.from?.id.toString() === this.adminId) {
            const users = await this.getAllUsers();
            if (users.length > 0) {
                const userList = users.map((user) => `ID: ${user.id}, User ID: ${user.userId}, Username: ${user.username}`).join('\n');
                ctx.reply(`Registered users:\n\n${userList}`);
            } else {
                ctx.reply('No registered users found.');
            }
        } else {
            ctx.reply('You are not authorized to view users.');
        }
    }

    private async registerUser(userId: string, username: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `INSERT INTO users (userId, username) VALUES (?, ?)`;
            this.db.run(query, [userId, username], function (error) {
                if (error) {
                    console.error('Failed to register user:', error);
                    reject(error);
                } else {
                    console.log(`User ${userId} registered successfully.`);
                    resolve();
                }
            });
            this.users.push({
                userId,
                username
            })
        });
    }

    private async removeUser(userId: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM users WHERE userId = ?`;
            this.db.run(query, [userId], function (error) {
                if (error) {
                    console.error('Failed to remove user:', error);
                    reject(error);
                } else {
                    console.log(`User ${userId} removed successfully.`);
                    resolve();
                }
            });
        });
    }

    private async getAllUsers(): Promise<User[]> {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM users`;
            this.db.all(query, [], (error, rows: DatabaseRow[]) => {
                if (error) {
                    console.error('Failed to fetch users:', error);
                    reject(error);
                } else {
                    const users = rows.map((row) => ({
                        id: row.id,
                        userId: row.userId,
                        username: row.username
                    }));
                    resolve(users);
                }
            });
        });
    }


    public sendNewCoinNotification(coins: any[]): void {
        for (const coin of coins) {
            const message = `New coin detected!\nName: ${coin.name}\nSymbol: ${coin.symbol}`;

            for (const user of this.users) {
                this.bot.telegram.sendMessage(user.userId, message);
            }
        }
    }
}
