import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as rootUrl } from "./utils-CBgZTdf5.mjs";
//#region lib/routes/odaily/search-news.ts
const route = {
	path: "/search/news/:keyword",
	categories: ["new-media"],
	example: "/odaily/search/news/RSS3",
	parameters: { keyword: "搜索关键字" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["0daily.com/search/:keyword"] }],
	name: "搜索快讯",
	maintainers: ["snowraincloud"],
	handler
};
async function handler(ctx) {
	const items = (await got_default({
		method: "get",
		url: `${rootUrl}/api/pp/api/search/entity-search?per_page=${ctx.req.query("limit") ?? 25}&keyword=${ctx.req.param("keyword")}&entity_type=newsflash`
	})).data.data.items.map((item) => ({
		title: item.title,
		link: item.news_url,
		pubDate: timezone(parseDate(item.published_at), 8),
		description: `<p>${item.description}</p>`
	}));
	return {
		title: "快讯 - Odaily星球日报",
		link: `${rootUrl}/search/${ctx.req.param("keyword")}`,
		item: items
	};
}
//#endregion
export { route };
