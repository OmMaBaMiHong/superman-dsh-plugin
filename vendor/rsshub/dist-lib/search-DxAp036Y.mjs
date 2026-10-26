import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import querystring from "node:querystring";
//#region lib/routes/melonbooks/parser.ts
function parseItems($, baseUrl, fetchRestrictedContent) {
	const list = $("div.item-list ul li").toArray().map((el) => {
		const $el = $(el);
		const a = $el.find("a").first();
		const title = a.attr("title");
		const link = fetchRestrictedContent ? `${a.attr("href")}&adult_view=1` : a.attr("href");
		const category = [$el.find("p.item-state").text()];
		const image = $el.find("div.item-image img").attr("data-src");
		return {
			title,
			link,
			category,
			image,
			banner: image
		};
	});
	return Promise.all(list.map((item) => cache_default.tryGet(`${baseUrl}${item.link}`, async () => {
		const description = load(await rofetch(`${baseUrl}${item.link}`)).html("div.item-page");
		return {
			...item,
			description
		};
	})));
}
//#endregion
//#region lib/routes/melonbooks/search.ts
const handler = async (ctx) => {
	const baseUrl = "https://www.melonbooks.co.jp";
	const query = ctx.req.param("query") ?? "";
	const url = `${baseUrl}/search/search.php?${query}`;
	const fetchRestrictedContent = querystring.parse(query).adult_view === "1";
	return {
		title: "搜索结果",
		link: url,
		item: await parseItems(load(await rofetch(url)), baseUrl, fetchRestrictedContent)
	};
};
const route = {
	path: "/search/:query?",
	categories: ["anime"],
	example: "/melonbooks/search/name=けいおん",
	parameters: { category: "链接参数，对应网址问号后的内容，不携带问号" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "搜索结果",
	maintainers: ["cokemine"],
	description: `::: tip
如果你期望获取限制级内容，可以添加\`&adult_view=1\`参数
:::`,
	handler
};
//#endregion
export { handler, route };
