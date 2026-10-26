import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/linovelib/novel.ts
const route = {
	path: "/novel/:id",
	categories: ["reading"],
	example: "/linovelib/novel/2547",
	parameters: { id: "小说 id，对应书架开始阅读 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "小说更新",
	maintainers: ["misakicoca"],
	handler
};
async function handler(ctx) {
	const $ = load((await got_default(`https://www.linovelib.com/novel/${ctx.req.param("id")}/catalog`)).data);
	const meta = $(".book-meta");
	const title = meta.children().first().text();
	const author = meta.find("p > span > a").text();
	const items = $(".chapter-list").find("li").find("a").toArray().filter((item) => $(item).attr("href").startsWith("/novel/")).map((item) => ({
		title: $(item).text(),
		author,
		description: $(item).text(),
		link: `https://www.linovelib.com${$(item).attr("href")}`
	}));
	items.reverse();
	return {
		title: `哩哔轻小说 - ${title}`,
		link: `https://www.linovelib.com/novel/${ctx.req.param("id")}/catalog`,
		description: title,
		language: "zh",
		item: items
	};
}
//#endregion
export { route };
