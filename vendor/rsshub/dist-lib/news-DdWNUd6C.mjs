import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qianp/utils.ts
const getTokenAndSecret = () => cache_default.tryGet("qianp:token", async () => {
	const response = await got_default("https://qianp.com/news/recommend/");
	return {
		token: response.headers["set-cookie"].find((cookie) => cookie.startsWith("token="))?.split(";", 1)[0]?.split("=", 2)[1],
		secret: response.headers["set-cookie"].find((cookie) => cookie.startsWith("secret="))?.split(";", 1)[0]?.split("=", 2)[1]
	};
});
//#endregion
//#region lib/routes/qianp/news.ts
const route = {
	path: "/news/:path{.+}?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://qianp.com";
	const { path = "news/recommend" } = ctx.req.param();
	const url = `${baseUrl}/${path}/`;
	const { token, secret } = await getTokenAndSecret();
	const headers = { cookie: token ? `t=${token}; r=${secret - 100}` : void 0 };
	const { data: response } = await got_default(url, { headers });
	const $ = load(response);
	const list = $(".newslist .infor").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		return {
			title: a.attr("title"),
			link: a.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link, { headers });
		const $ = load(response);
		item.category = [...new Set($("meta[name=keywords]").attr("content").split("，"))];
		item.author = $("meta[name=author]").attr("content");
		item.pubDate = parseDate($("meta[property=\"bytedance:published_time\"]").attr("content"));
		item.description = $(".news_center").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: url,
		image: `${baseUrl}/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
