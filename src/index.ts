import { Client } from "discord.js"
import {PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()
let allusers:any
const client = new Client()
const env:any = process.env
const discord_token:any = env.token

async function getall() {
    allusers = JSON.stringify(await prisma.user.findMany())
    console.log(typeof allusers)
}

async function register() {

}


client.on('ready', () => {
    console.log("Started")
})

client.on('message', async (message:any) =>{
    if (message.author.bot) {
        return
    }
    if (message.content === "l!init") {
            // call.submit()
    }

    if (message.content === "l!all") {
        getall()
            .catch(e => {
                throw e
            })
            .finally(async ()=> {
                await prisma.$disconnect()
                console.log(`aaa${allusers}`)
                await message.channel.send(`\`\`\`${allusers}\`\`\``)
            })
    }

    if (message.content === "l!register") {
        register()
            .catch(e => {
                throw e
            })
            .finally(async ()=> {
            })
    }

})



client.login(discord_token)

