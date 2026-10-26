import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/aliresearch/information.ts
const route = {
	path: "/information/:type?",
	categories: ["new-media"],
	example: "/aliresearch/information",
	parameters: { type: "类型，见下表，默认为新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["aliresearch.com/cn/information", "aliresearch.com/"],
		target: "/information"
	}],
	name: "资讯",
	maintainers: ["nczitzk"],
	handler,
	url: "aliresearch.com/cn/information",
	description: `| 新闻 | 观点 | 案例 |
| ---- | ---- | ---- |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "新闻";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	const rootUrl = "http://www.aliresearch.com";
	const currentUrl = `${rootUrl}/cn/information`;
	let items = (await got_default({
		method: "post",
		url: `${rootUrl}/ch/listArticle`,
		json: {
			pageNo: 1,
			pageSize: 10,
			type
		}
	})).data.data.slice(0, limit).map((item) => ({
		title: item.articleCode,
		author: item.author,
		pubDate: timezone(parseDate(item.gmtCreated), 8),
		link: `${rootUrl}/ch/information/informationdetails?articleCode=${item.articleCode}`
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const data = (await got_default({
			method: "post",
			url: `${rootUrl}/ch/getArticle`,
			json: { articleCode: item.title }
		})).data.data;
		item.title = data.title;
		item.description = data.content;
		item.category = data.special.split(",");
		return item;
	})));
	return {
		title: `阿里研究院 - ${type}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
