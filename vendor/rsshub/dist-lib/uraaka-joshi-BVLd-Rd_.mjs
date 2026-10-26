import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/uraaka-joshi/uraaka-joshi.ts
const route = {
	path: "/",
	radar: [{
		source: ["uraaka-joshi.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["SettingDust", "Halcao"],
	handler,
	url: "uraaka-joshi.com/",
	features: { nsfw: true }
};
async function handler() {
	const link = "https://www.uraaka-joshi.com/";
	const title = "裏垢女子まとめ";
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "fetch" ? route.continue() : route.abort();
	});
	page.on("requestfinished", async (request) => {
		if (request.url() !== link) return;
		if ((await request.response())?.status() === 403) await page.close();
	});
	let html;
	try {
		await page.goto(link, { waitUntil: "domcontentloaded" });
		await page.waitForSelector("#pickup03 .grid-cell");
		await page.waitForSelector("#pickup04 .grid-cell");
		await page.waitForSelector("#main-block .grid-cell");
		const bodyHandle = await page.$("body");
		html = await page.evaluate((body) => body.innerHTML, bodyHandle);
	} catch {
		throw new Error("Access denied (403)");
	}
	await context.close();
	const $ = load(html);
	return {
		title,
		link,
		item: $(".grid-cell").toArray().map((item) => {
			item = $(item);
			item.find("*").removeAttr("onclick");
			item.find("*").removeAttr("onerror");
			item.find("*").removeAttr("style");
			const account = item.find(".account-group-link-row");
			account.html(account.text());
			item.find(".plyr--video").each((_, player) => {
				player = $(player);
				const video = player.find("video");
				player.replaceWith(video);
				const poster = video.attr("data-poster");
				video.attr("poster", "https:" + poster);
				const source = video.find("source");
				const src = source.attr("src");
				source.attr("src", "https:" + src);
			});
			item.find("img").each((_, image) => {
				const src = $(image).attr("data-src");
				$(image).attr("src", "https:" + src);
			});
			return {
				title: item.find(".account-group").text() + ` - ${title}`,
				description: item.html(),
				link: item.find(".account-group-link-row").attr("href"),
				pubDate: parseDate(item.find(".profile-char").attr("datetime")),
				guid: item.find("a.tap-image").attr("data-tweet-id") || item.find("video[class^=\"js-player-\"]").attr("data-tweet-id") || parseDate(item.find(".profile-char").attr("datetime")).getTime()
			};
		})
	};
}
//#endregion
export { route };
