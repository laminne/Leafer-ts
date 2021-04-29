import { Client } from "discord.js"
import {PrismaClient} from '@prisma/client'
import puppeteer from "puppeteer"

const prisma = new PrismaClient()
let reg:any
let allusers:any
let discord_id:any
let gh_user_name:any
const client = new Client()
const env:any = process.env
let discord_token:any = env.token


async function getall() {
    allusers = JSON.stringify(await prisma.user.findMany())
    console.log(typeof allusers)
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
    })
}

async function screenshot() {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            "--disable-web-security"
        ]
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1920,height: 1080})
    await page.goto("https://github.com/laminne")
    const rect = await page.evaluate(() => {
        const learnMore = document.querySelector("#js-pjax-container > div.mt-4.position-sticky.top-0.d-none.d-md-block.color-bg-primary.width-full.border-bottom.color-border-secondary > div > div > div.flex-shrink-0.col-12.col-md-9.mb-4.mb-md-0 > div")
        learnMore?.parentElement?.removeChild(learnMore)
        const rect = document
            ?.querySelector(".graph-before-activity-overview")
            ?.getBoundingClientRect()
        if (!rect) return null
        return {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
        }
    })
    const element = await page.$(".graph-before-activity-overview");
    if (element!) {
        await element.screenshot({clip: rect, path: 'screenShotPage.png'});
    }
    await browser.close()
    console.log("done")
}



client.on('ready', () => {
    console.log("Started")
})

client.on('message', async (message:any) =>{
    if (message.author.bot) {
        return
    }
    if (message.content === "l!get") {
        message.channel.send(`<@${message.author.id}>\n取得を開始します,これには時間がかかります`)
        await screenshot()
            .catch(e => {
                message.channel.send(`<@${message.author.id}>\nエラーが発生しました:\n` + "```"+ e + "```")
                throw e
            })
        message.channel.send(`<@${message.author.id}>\n取得しました`)
    }

    if (message.content === "l!all") {
        getall()
            .catch(e => {
                throw e
            })
            .finally(async ()=> {
                await prisma.$disconnect()
                console.log(`${allusers}`)
                await message.channel.send(`<@${message.author.id}>\n` + "```" + allusers + "```")
            })
    }

    if (message.content.startsWith('l!register')) {
        gh_user_name = message.content.substr(11, message.content.length)
        discord_id = message.author.id
        register()
            .catch(e => {
                message.channel.send(`<@${message.author.id}>\n` + "```"+ e + "```")
                throw e
            })
            .finally(async ()=> {
                await prisma.$disconnect()
                console.log(`${reg}`)
            })
    }

})



client.login(discord_token)

