import { Client, MessageAttachment } from "discord.js"
import {PrismaClient} from '@prisma/client'
import puppeteer from "puppeteer"


const prisma = new PrismaClient()
const client = new Client()
const env:any = process.env
let reg:any
let allusers:any
let discord_id:any
let gh_user_name:any
let discord_token:any = env.token
let grass:any

async function getall() {
    allusers = JSON.stringify(await prisma.user.findMany())
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

async function get(userid:any) {
    grass = JSON.stringify(await prisma.user.findUnique({
        where: {
            discord: userid,
        },
    }))
}

async function screenshot(filename:any) {
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
        console.log("ファイル名" + filename)
        await element.screenshot({clip: rect, path: `./images/${filename}.png`});
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
        await get(message.author.id)
        grass = JSON.parse(grass)
        await screenshot(grass.id)
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

    if (message.content === "草" || message.content === "kusa") {
        await get(message.author.id)
            .catch(e => {
                message.channel.send(`<@${message.author.id}>\n` + "```"+ e + "```")
                throw e
            })
            .finally(async ()=> {
                await prisma.$disconnect()
            })
        grass = JSON.parse(grass)
        let file = "./images/"+grass.id + ".png"
        message.channel.send(new MessageAttachment(file))
    }

})



client.login(discord_token)

