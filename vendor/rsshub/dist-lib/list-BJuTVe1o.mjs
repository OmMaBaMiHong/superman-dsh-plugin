import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/customs/utils.ts
const host = "http://www.customs.gov.cn";
const playwrightGet = async (url, context) => {
	const page = await context.newPage();
	await page.setExtraHTTPHeaders({ referer: host });
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await page.waitForSelector(".pubCon");
	return await page.evaluate(() => document.documentElement.innerHTML);
};
//#endregion
//#region lib/routes/gov/customs/list.ts
const route = {
	path: "/list/:gchannel?",
	categories: ["government"],
	example: "/gov/customs/list/paimai",
	parameters: { gchannel: "支持 `paimai`, `fagui` 及 `latest` 3 个频道，默认为 `paimai`" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.customs.gov.cn/"],
		target: "/list"
	}],
	name: "拍卖信息 / 海关法规 / 最新文件",
	maintainers: [
		"Jeason0228",
		"TonyRL",
		"he1q"
	],
	handler,
	url: "www.customs.gov.cn/",
	description: `::: warning
由于区域限制，建议在国内 IP 的机器上自建
:::`
};
async function handler(ctx) {
	const { gchannel = "paimai" } = ctx.req.param();
	let channelName;
	let link = "";
	switch (gchannel) {
		case "paimai":
			channelName = "拍卖信息";
			link = `${host}/customs/302249/zfxxgk/2799825/2799883/index.html`;
			break;
		case "fagui":
			channelName = "海关法规";
			link = `${host}/customs/302249/302266/index.html`;
			break;
		case "latest":
			channelName = "最新文件";
			link = `${host}/customs/302249/2480148/index.html`;
			break;
		default:
			channelName = "拍卖信息";
			link = `${host}/customs/302249/zfxxgk/2799825/2799883/index.html`;
			break;
	}
	const context = await outPlaywright();
	const list = await cache_default.tryGet(link, async () => {
		const $ = load(await playwrightGet(link, context));
		return $("[class^=\"conList_ul\"] li").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("a").attr("title"),
				link: new URL(item.find("a").attr("href"), host).href,
				date: parseDate(item.find("span").text())
			};
		});
	}, config.cache.routeExpire, false);
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		if (info.link.endsWith(".pdf") || info.link.endsWith(".doc")) return info;
		const $ = load(await playwrightGet(info.link, context));
		let date;
		$(".easysite-news-operation").remove();
		if (/\d{4}-\d{2}-\d{2} \d{2}:\d{2}/.test($(".easysite-news-describe").text())) date = timezone(parseDate($(".easysite-news-describe").text(), "YYYY-MM-DD HH:mm"), 8);
		const description = $(".easysite-news-peruse").html();
		return {
			title: info.title,
			link: info.link,
			description,
			pubDate: date || info.date
		};
	})));
	await context.close();
	return {
		title: `中国海关-${channelName}`,
		link,
		language: "zh-CN",
		item: out
	};
}
//#endregion
export { route };
