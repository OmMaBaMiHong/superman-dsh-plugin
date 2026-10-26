import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/dyyy/index.ts
const baseUrl = "http://www.dyyy.xjtu.edu.cn";
const route = {
	path: "/dyyy/:path{.+}",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const path = ctx.req.param("path");
	const response = await got_default(`${baseUrl}/${path}.htm`);
	const $ = load(response.data);
	const items = $(".list_right_con div li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), response.url).href,
			pubDate: parseDate(item.find(".data").text())
		};
	});
	await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.author = $(".content_source").text().match(/责任编辑：(.*)\(点击/)[1];
		item.description = $(".content_con").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link: `${baseUrl}/${path}.htm`,
		item: items
	};
}
//#endregion
export { route };
