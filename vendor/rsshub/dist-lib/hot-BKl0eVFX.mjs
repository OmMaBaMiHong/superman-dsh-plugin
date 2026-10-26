import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as renderDepthDescription } from "./depth-DXvPxpK8.mjs";
import { n as rootUrl, t as getSearchParams } from "./utils-BTIOSr4q.mjs";
import { load } from "cheerio";
//#region lib/routes/cls/hot.ts
const route = {
	path: "/hot",
	categories: ["finance"],
	example: "/cls/hot",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cls.cn/"] }],
	name: "热门文章排行榜",
	maintainers: ["5upernova-heng", "nczitzk"],
	handler,
	url: "cls.cn/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	let items = (await rofetch(`${rootUrl}/v2/article/hot/list`, { query: getSearchParams() })).data.slice(0, limit).map((item) => ({
		title: item.title || item.brief,
		link: `${rootUrl}/detail/${item.id}`,
		pubDate: parseDate(item.ctime, "X"),
		author: item.author
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load(await rofetch(item.link));
		const articleDetail = JSON.parse(content("script#__NEXT_DATA__").text()).props.pageProps.articleDetail;
		item.author = articleDetail.author?.name ?? item.author ?? "";
		item.description = renderDepthDescription(articleDetail);
		return item;
	})));
	return {
		title: "财联社 - 热门文章排行榜",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
