import {PrismaClient} from "@prisma/client"
import puppeteer from "puppeteer"
import cron from "node-cron"

export const prisma = new PrismaClient()
export let reg:any
export let allusers:any
export let discord_id:string
export let gh_user_name:string
export let grass:any


export async function getall() {
    allusers = JSON.stringify(await prisma.user.findMany())
    return allusers
}

export async function register() {
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

export async function update(id:string, ghid:string){
    await prisma.user.update({
        where: {discord: id},
        data: {github: ghid}
    })
}

export async function get(userid:any) {
    grass = JSON.stringify(await prisma.user.findUnique({
        where: {
            discord: userid,
        },
    }))
    return grass
}

export async function screenshot(filename:any, username:string) {
    const browser = await puppeteer.launch({
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            "--disable-web-security"
        ],
        executablePath: '/home/laminne/chrome-linux/chrome'
    })
    const page = await browser.newPage()
    await page.setViewport({width: 1920,height: 1080})
    await page.goto("https://github.com/" + username)
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


cron.schedule('0 0 9 * * *', async () => {
	let all:any
	all = JSON.parse(await getall())

	for (let i = 0; i < all.length; i++){
		screenshot(all[i].id, all[i].github)
			.catch(e => {
				console.log(all[i].id + ": 失敗")
				throw e
			})
		console.log("完了")
	}
	
})

export async function img_update(){
	let all:any
	all = JSON.parse(await getall())
	
	for (let i = 0; i < all.length; i++){
		await screenshot(all[i].id, all[i].github)
			.catch(e => {
				console.log(all[i].id + ": 失敗")
				throw e
			})
		await console.log(all[i].id)
		await console.log("完了")
	}
	console.log(`${all.length}個の画像データを更新しました`)
	return `${all.length}個の画像データを更新しました`
}


