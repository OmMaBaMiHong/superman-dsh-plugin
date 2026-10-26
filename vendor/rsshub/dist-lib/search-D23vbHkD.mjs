import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/google/search.ts
const route = {
	path: "/search/:keyword/:language?",
	categories: ["other"],
	example: "/google/search/rss/zh-CN,zh",
	parameters: {
		keyword: "Keyword",
		language: "Accept-Language. Example: `zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	maintainers: ["CaoMeiYouRen"],
	handler
};
async function handler(ctx) {
	const { keyword, language = "en" } = ctx.req.param();
	const searchParams = new URLSearchParams({ q: keyword });
	const tempUrl = new URL("https://www.google.com/search");
	tempUrl.search = searchParams.toString();
	const url = tempUrl.href;
	const key = `google:search:${language}:${url}`;
	const items = await cache_default.tryGet(key, async () => {
		const $ = load(await rofetch(url, { headers: {
			"Accept-Language": language,
			"User-Agent": "Lynx/2.9.2 libwww-FM/2.14 SSL-MM/1.4.1 OpenSSL/3.5.0"
		} }));
		return $("body > div > div > div > div > div > div > a").toArray().map((el) => {
			const element = $(el);
			const link = element.attr("href");
			const title = element.find("span").first().text().trim();
			const description = element.parent().next().find("span > span").last().text().trim().replaceAll("�", "") || "";
			const author = element.find("span > span").text().trim() || "";
			return {
				link: new URL(link, "https://www.google.com").searchParams.get("q") || link,
				title,
				description,
				author
			};
		});
	}, config.cache.routeExpire, false);
	return {
		title: `${keyword} - Google Search`,
		description: `${keyword} - Google Search`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
