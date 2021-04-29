"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
let allusers;
async function main() {
    allusers = JSON.stringify(await prisma.user.findMany());
    console.log(typeof allusers);
}
const client = new discord_js_1.Client();
const env = process.env;
const discord_token = env.token;
client.on('ready', () => {
    console.log("Started");
});
client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }
    if (message.content === "l!init") {
    }
    if (message.content === "l!all") {
        main()
            .catch(e => {
            throw e;
        })
            .finally(async () => {
            await prisma.$disconnect();
            console.log(`aaa${allusers}`);
            await message.channel.send(`\`\`\`${allusers}\`\`\``);
        });
    }
});
client.login(discord_token);
