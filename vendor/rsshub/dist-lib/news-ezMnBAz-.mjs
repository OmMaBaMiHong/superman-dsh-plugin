import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/gf-cn/news.ts
const titles = {
	1: "新闻",
	3: "公告"
};
const route = {
	path: "/news/:category?",
	categories: ["game"],
	example: "/gf-cn/news",
	parameters: { category: "分类，见下表，默认为新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sunborngame.com/:category", "sunborngame.com/"] }],
	name: "情报局",
	maintainers: ["nczitzk"],
	handler,
	description: `| 新闻 | 公告 |
| ---- | ---- |
| 1    | 3    |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "1";
	const rootUrl = "https://gf-cn.sunborngame.com";
	const apiRootUrl = "https://gfcn-webserver.sunborngame.com";
	const apiUrl = `${apiRootUrl}/website/news_list/${category}?page=0&limit=${ctx.req.query("limit") ?? 50}`;
	const currentUrl = `${rootUrl}/News`;
	let items = (await got_default({
		method: "get",
		url: apiUrl
	})).data.data.list.map((item) => ({
		guid: item.Id,
		title: item.Title,
		link: `${rootUrl}/NewsInfo?id=${item.Id}`,
		pubDate: timezone(parseDate(item.Date), 8)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = (await got_default({
			method: "get",
			url: `${apiRootUrl}/website/news/${item.guid}`
		})).data.data.Content.replaceAll("<img src=\"", "<img src=\"https://gf-cn.cdn.sunborngame.com/website/cms/");
		return item;
	})));
	return {
		title: `${titles[category]} - 少女前线 - 情报局`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
