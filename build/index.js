"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const client_1 = require("@prisma/client");
const puppeteer_1 = __importDefault(require("puppeteer"));
const prisma = new client_1.PrismaClient();
let reg;
let allusers;
let discord_id;
let gh_user_name;
const client = new discord_js_1.Client();
const env = process.env;
let discord_token = env.token;
async function getall() {
    allusers = JSON.stringify(await prisma.user.findMany());
    console.log(typeof allusers);
}
async function register() {
    reg = await prisma.user.create({
        data: {
            discord: discord_id,
            github: gh_user_name,
            grass: {
                create: {}
            }
        }
    });
}
async function screenshot() {
    const browser = await puppeteer_1.default.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto("https://github.com/laminne");
    const element = await page.$(".graph-before-activity-overview");
    if (element) {
        await element.screenshot({ path: 'screenShotPage.png' });
    }
    await browser.close();
    console.log("done");
}
client.on('ready', () => {
    console.log("Started");
});
client.on('message', async (message) => {
    if (message.author.bot) {
        return;
    }
    if (message.content === "l!get") {
        message.channel.send("取得を開始します,これには時間がかかります");
        await screenshot()
            .catch(e => {
            message.channel.send("エラーが発生しました:\n```" + e + "```");
            throw e;
        });
    }
    if (message.content === "l!all") {
        getall()
            .catch(e => {
            throw e;
        })
            .finally(async () => {
            await prisma.$disconnect();
            console.log(`aaa${allusers}`);
            await message.channel.send(`\`\`\`${allusers}\`\`\``);
        });
    }
    if (message.content.startsWith('l!register')) {
        gh_user_name = message.content.substr(11, message.content.length);
        discord_id = message.author.id;
        register()
            .catch(e => {
            message.channel.send("```" + e + "```");
            throw e;
        })
            .finally(async () => {
            await prisma.$disconnect();
            console.log(`${reg}`);
        });
    }
});
client.login(discord_token);
