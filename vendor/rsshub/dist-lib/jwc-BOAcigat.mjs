import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wfu/jwc.ts
const baseUrl = "https://jwc.wfu.edu.cn/3742/list.htm";
const sizeTitle = "潍坊学院教务处新闻";
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/wfu/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwc.wfu.edu.cn/"] }],
	name: "教务处通知",
	maintainers: ["cccht"],
	handler,
	url: "jwc.wfu.edu.cn/"
};
async function handler() {
	const list = load((await got_default({
		method: "get",
		url: baseUrl,
		headers: { Referer: "https://jwc.wfu.edu.cn/" }
	})).data)("ul.wp_article_list>li");
	const result = await Promise.all(list.toArray().map((item) => {
		const $ = load(item);
		const $article_title = $("div.pr_fields>span.Article_Title>a");
		const $item_url = "https://jwc.wfu.edu.cn/" + $article_title.attr("href");
		return {
			title: $article_title.text(),
			link: $item_url,
			guid: $item_url,
			description: $("div.pr_fields>span.Article_Title").html()
		};
	}));
	return {
		title: sizeTitle,
		link: baseUrl,
		description: "潍坊学院教务处通知（通知为文件需下载）",
		item: result
	};
}
//#endregion
export { route };
