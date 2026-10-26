import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/chinatimes/index.ts
const route = {
	path: "/:category?",
	categories: ["traditional-media"],
	example: "/chinatimes/realtimenews",
	parameters: { category: "分類，見下表，留空為 `realtimenews`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.chinatimes.com/:category/", "www.chinatimes.com/"] }],
	name: "分類",
	maintainers: ["KingJem"],
	handler,
	url: "www.chinatimes.com/",
	description: `|     即時     |   熱門  |   政治  | 生活 | 娛樂 |  財經 |  國際 |   言論  |   兩岸  |   軍事   |   社會  |  健康  |  體育  |      科技      |   運勢  | 有影 |  寶島  |
| :----------: | :-----: | :-----: | :--: | :--: | :---: | :---: | :-----: | :-----: | :------: | :-----: | :----: | :----: | :------------: | :-----: | :--: | :----: |
| realtimenews | hotnews | politic | life | star | money | world | opinion | chinese | armament | society | health | sports | technologynews | fortune | tube | taiwan |`
};
async function handler(ctx) {
	const baseUrl = "https://www.chinatimes.com";
	const { category = "realtimenews" } = ctx.req.param("category");
	const link = `${baseUrl}/${category}/?chdtv`;
	const $ = load(await rofetch(link));
	const context = await outPlaywright();
	const list = $(".articlebox-compact").toArray().slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20).map((item) => {
		const $item = $(item);
		const a = $item.find(".title a");
		return {
			title: a.text().trim(),
			link: `${baseUrl}${a.attr("href")}?chdtv`,
			guid: `${baseUrl}${a.attr("href")}`,
			pubDate: timezone(parseDate($item.find("time").attr("datetime")), 8),
			category: $item.find(".category a").toArray().map((i) => $(i).text().trim())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${item.link}`);
		await page.goto(item.link, { waitUntil: "domcontentloaded" });
		const response = await page.content();
		await page.close();
		const $ = load(response);
		item.category = [.../* @__PURE__ */ new Set([...item.category, ...$(".article-hash-tag a").toArray().map((i) => $(i).text().trim())])];
		$(".ad, #donate-form-container, .promote-word, .google-news-promote, .article-hash-tag").remove();
		item.description = $(".main-figure").html() + $(".article-body").html();
		return item;
	})));
	await context.close();
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link,
		language: $("html").attr("lang"),
		image: `${baseUrl}/images/2020/apple-touch-icon.png`,
		item: items
	};
}
//#endregion
export { route };
