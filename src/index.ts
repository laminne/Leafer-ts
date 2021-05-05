import { Client, MessageAttachment } from "discord.js"
import {prisma, reg, allusers, getall, img_update, register, update, get, screenshot } from "./function"

const client = new Client()
const env:any = process.env
let discord_token:any = env.token


client.on('ready', () => {
    console.log("Started")
})


client.on('message', async (message:any) =>{
    const gh_not_user_name_urls = ["features", "mobile", "sponsors", "customer-stories", "team", "enterprise", "explore", "topics", "collections", "events", "readme", "marketplace", "pricing", "login", "join", "site-map", "git-guides", "about"]

    if (message.author.bot) {
        return
    }
    
    if (message.content === "l!get") {
    	let grass:any

        message.channel.send(`<@${message.author.id}>\n取得を開始します,これには時間がかかります`)
        grass = JSON.parse(await get(message.author.id))
        
        await screenshot(grass.id, grass.github)
            .catch(e => {
                message.channel.send(`<@${message.author.id}>\nエラーが発生しました:\n` + "```"+ e + "```")
                throw e
            })
    }

    if (message.content === "l!help") {
        await message.channel.send("```Leafer-node \nLeaferのTypeScript実装\n\nl!register <GitHubのユーザー名> :登録します\nl!get :画像を取得します\n機能はこれだけです\n'草'、'kusa'に反応します```")
    }

    if (message.content === "l!img"){
		let res:string
    	res = await img_update()
    	await message.channel.send(res)
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

    if (message.content.startsWith('l!update')) {
    	let gh_user_name:string
    	let discord_id:string
    	
        gh_user_name = message.content.substr(9, message.content.length).trim()
        if (gh_user_name.match(/\//)){
            console.log("不正")
            message.channel.send(`<@${message.author.id}>\n` + "不正なユーザー名です")
            return
        }

        if (gh_not_user_name_urls.includes(gh_user_name)){
            console.log("GitHub")
            message.channel.send(`<@${message.author.id}>\nそのユーザー名は不正です`)
            return
        } else {
            discord_id = message.author.id
            console.log(discord_id, gh_user_name)

            let status:string = "成功"

            update(discord_id,gh_user_name)
                .catch(e => {
                    message.channel.send(`<@${message.author.id}>\n` + "```"+ e + "```")
                    status = "失敗"
                    throw e
                })
                .finally(async ()=> {
                    await prisma.$disconnect()

                    await message.channel.send(`<@${message.author.id}>\n` + "再登録に" + status + "しました")
                })
        }
    }

    
    if (message.content.startsWith('l!register')) {
    	let gh_user_name:string
    	let discord_id:string
    	    	
        gh_user_name = message.content.substr(11, message.content.length).trim()
        if (gh_user_name.match(/\//)){
            console.log("不正")
            message.channel.send(`<@${message.author.id}>\n` + "不正なユーザー名です")
            return
        }

        discord_id = message.author.id
        if (gh_not_user_name_urls.includes(gh_user_name)){
            console.log("不正なURL:GitHub")
            message.channel.send(`<@${message.author.id}>\nそのユーザー名は不正です`)
            return
        } else {
            let status:string = "成功"
            register()
                .catch(e => {
                    message.channel.send(`<@${message.author.id}>\n` + "```"+ e + "```")
                    status = "失敗"
                    throw e
                })
                .finally(async ()=> {
                    await prisma.$disconnect()
                    console.log(`${reg}`)
                    await message.channel.send(`<@${message.author.id}>\n` + "登録に" + status + "しました")
                })
        }
    }


    if (message.content === "草" || message.content === "kusa" || message.content === "grass" || message.content === "<:grass:720993758832754728>") {
    	let grass:any
    	
        grass = await get(message.author.id)
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

