import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chinaventure/index.ts
const rootUrl = "https://www.chinaventure.com.cn";
const nodes = {
	78: "商业深度",
	80: "资本市场",
	83: "5G",
	111: "健康",
	110: "教育",
	112: "地产",
	113: "金融",
	114: "硬科技",
	116: "新消费"
};
const route = {
	path: "/news/:id?",
	categories: ["new-media"],
	example: "/chinaventure/news/78",
	parameters: { id: "分类，见下表，默认为推荐" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["chinaventure.com.cn/"],
		target: ""
	}],
	name: "分类",
	maintainers: ["yuxinliu-alex"],
	handler,
	url: "chinaventure.com.cn/",
	description: `| 推荐 | 商业深度 | 资本市场 | 5G | 健康 | 教育 | 地产 | 金融 | 硬科技 | 新消费 |
| ---- | -------- | -------- | -- | ---- | ---- | ---- | ---- | ------ | ------ |
|      | 78       | 80       | 83 | 111  | 110  | 112  | 113  | 114    | 116    |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const currentUrl = rootUrl.concat(id ? `/news/${id}.html` : "/index.html");
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const limit = ctx.req.query("limit");
	const list = $("a", ".common_newslist_pc").filter((element) => $(element).attr("href")).toArray().map((item) => ({ link: rootUrl + $(item).attr("href") })).slice(0, limit ? Number.parseInt(limit) : 20);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("h1.maintitle_pc").text();
		item.description = content("div.article_slice_pc").html();
		item.author = content("div.source_author").text();
		item.pubDate = timezone(parseDate(content("div.releaseTime").text()), 8);
		return item;
	})));
	return {
		title: `${nodes[id] ?? "推荐"}-投中网`,
		link: currentUrl,
		description: "投中网是国内领先的创新经济信息服务平台，拥有立体化媒体矩阵，十多年行业深耕，为创新经济领域核心人群提供深入、独到的智识和洞见，在私募股权投资行业和创新商业领域均拥有权威影响力。",
		language: "zh-cn",
		item: items
	};
}
//#endregion
export { route };
