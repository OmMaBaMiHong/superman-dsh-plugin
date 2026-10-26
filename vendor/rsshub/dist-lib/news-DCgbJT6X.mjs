import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/acgvinyl/news.ts
const route = {
	path: "/news",
	categories: ["anime"],
	example: "/acgvinyl/news",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.acgvinyl.com"],
		target: "/news"
	}],
	name: "News",
	maintainers: ["williamgateszhao"],
	handler,
	url: "www.acgvinyl.com/col.jsp?id=103",
	zh: { name: "黑胶新闻" }
};
async function handler(ctx) {
	const rootUrl = "http://www.acgvinyl.com";
	const newsIndexJsonText = load(await rofetch(`${rootUrl}/col.jsp?id=103`))("script:contains(\"window.__INITIAL_STATE__\")").text().replaceAll("window.__INITIAL_STATE__=", "");
	const newsIndexJson = JSON.parse(newsIndexJsonText);
	const limit = ctx.req.query("limit");
	const newsListResponse = await rofetch(`${rootUrl}/rajax/news_h.jsp?cmd=getWafNotCk_getList`, {
		method: "POST",
		headers: { "content-type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			page: "1",
			pageSize: String(limit ?? 20),
			fromMid: newsIndexJson.modules.module366.id,
			idList: `[${newsIndexJson.modules.module366.prop3}]`,
			sortKey: newsIndexJson.modules.module366.blob0.sortKey,
			sortType: newsIndexJson.modules.module366.blob0.sortType
		}).toString()
	});
	const list = JSON.parse(newsListResponse);
	if (!list?.success || !Array.isArray(list?.list)) return null;
	return {
		title: "ACG Vinyl - 黑胶 - 黑胶新闻",
		link: "http://www.acgvinyl.com/col.jsp?id=103",
		item: await Promise.all(list.list.map((item) => cache_default.tryGet(item.url, async () => {
			const detailJsonText = load(await rofetch(`${rootUrl}${item.url}`))("script:contains(\"window.__INITIAL_STATE__\")").text().replaceAll("window.__INITIAL_STATE__=", "");
			const detail = load(JSON.parse(detailJsonText).modules.module2.newsInfo.content);
			detail("[style]").removeAttr("style");
			return {
				title: item.title,
				link: `${rootUrl}${item.url}`,
				pubDate: parseDate(item.date),
				description: detail.html()
			};
		})))
	};
}
//#endregion
export { route };
