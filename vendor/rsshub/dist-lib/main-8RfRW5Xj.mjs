import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/solidot/_article.ts
async function get_article(url) {
	const domain = "https://www.solidot.org";
	if (/^\/.*$/.test(url)) url = domain + url;
	const data = (await got_default({
		method: "get",
		url
	})).data;
	const $ = load(data);
	const date_str = $("div.talk_time").clone().children().remove().end().text().replaceAll(/^[^`]*发表于(?=(.*分))\1[^`]*$/g, "$1").replaceAll(/[年月]/g, "-").replaceAll("时", ":").replaceAll(/[分日]/g, "");
	const title = $("div.block_m > div.ct_tittle > div.bg_htit > h2").text();
	const category = $("div.icon_float > a").attr("title");
	const author = $("div.talk_time > b").text().replaceAll(/^来自(.*)部门$/g, "$1");
	$("div.ct_tittle").remove();
	$("div.talk_time").remove();
	const description = $("div.block_m").html().replaceAll(/(href.*?)<u>(.*?)<\/u>/g, "$1$2").replaceAll("href=\"/", () => "href=\"https://www.solidot.org/").replaceAll(/(<img.*liiLIZF8Uh6yM.*?>)/g, "<br><br>$1");
	return {
		title,
		pubDate: timezone(parseDate(date_str), 8),
		author,
		link: url,
		description,
		category
	};
}
//#endregion
//#region lib/routes/solidot/main.ts
const route = {
	path: "/:type?",
	categories: ["traditional-media"],
	view: 0,
	example: "/solidot/linux",
	parameters: { type: {
		description: "消息类型，在网站上方选择后复制子域名或参见 [https://www.solidot.org/index.rss](https://www.solidot.org/index.rss) 即可",
		options: [
			{
				value: "www",
				label: "全部"
			},
			{
				value: "startup",
				label: "创业"
			},
			{
				value: "linux",
				label: "Linux"
			},
			{
				value: "science",
				label: "科学"
			},
			{
				value: "technology",
				label: "科技"
			},
			{
				value: "mobile",
				label: "移动"
			},
			{
				value: "apple",
				label: "苹果"
			},
			{
				value: "hardware",
				label: "硬件"
			},
			{
				value: "software",
				label: "软件"
			},
			{
				value: "security",
				label: "安全"
			},
			{
				value: "games",
				label: "游戏"
			},
			{
				value: "books",
				label: "书籍"
			},
			{
				value: "ask",
				label: "ask"
			},
			{
				value: "idle",
				label: "idle"
			},
			{
				value: "blog",
				label: "博客"
			},
			{
				value: "cloud",
				label: "云计算"
			},
			{
				value: "story",
				label: "奇客故事"
			}
		],
		default: "www"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新消息",
	maintainers: [
		"sgqy",
		"hang333",
		"TonyRL"
	],
	handler
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "www";
	if (!isValidHost(type)) throw new InvalidParameterError("Invalid type");
	const base_url = `https://${type}.solidot.org`;
	const data = (await got_default({
		method: "get",
		url: base_url
	})).data;
	const $ = load(data);
	const a = $("div.block_m").find("div.bg_htit > h2 > a");
	const urls = Array.from(a, (element) => $(element).attr("href"));
	return {
		title: "奇客的资讯，重要的东西",
		link: base_url,
		item: await Promise.all(urls.map((u) => cache_default.tryGet(u, () => get_article(u))))
	};
}
//#endregion
export { route };
