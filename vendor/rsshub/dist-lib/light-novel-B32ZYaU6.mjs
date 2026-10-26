import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/lightnovel/light-novel.ts
const route = {
	path: "/:keywords/:security_key?",
	radar: [{
		source: ["lightNovel.us/"],
		target: "/:keywords/:security_key"
	}],
	name: "Unknown",
	maintainers: ["nightmare-mio"],
	handler,
	url: "lightNovel.us/"
};
async function handler(ctx) {
	const baseUrl = "https://www.lightnovel.us";
	const { type, keywords, security_key = config.lightnovel.cookie } = ctx.req.param();
	const { data: response } = await got_default({
		method: "POST",
		url: `${baseUrl}/proxy/api/search/search-result`,
		headers: { "User-Agent": config.trueUA },
		json: {
			is_encrypted: 0,
			platform: "pc",
			client: "web",
			sign: "",
			gz: 0,
			d: {
				q: keywords,
				type: 0,
				page: 1,
				security_key
			}
		}
	});
	const list = response.data.articles.map((item) => ({
		title: item.title,
		link: `${baseUrl}/cn/detail/${item.aid}`,
		pubDate: parseDate(item.time),
		author: item.author
	})).slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 5);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default({
			method: "GET",
			url: item.link,
			headers: { "User-Agent": config.trueUA }
		});
		item.description = load(response)("#article-main-contents").html();
		return item;
	})));
	return {
		title: `轻之国度-追踪${keywords}更新-${type} `,
		link: baseUrl,
		item: items
	};
}
//#endregion
export { route };
