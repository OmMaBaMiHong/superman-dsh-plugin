import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cas/is/index.ts
const baseUrl = "https://is.cas.cn";
const route = {
	path: "/is/:path{.+}",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const path = ctx.req.param("path");
	const response = await got_default(`${baseUrl}/${path}/`);
	const $ = load(response.data);
	const items = $(".list-news ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			link: new URL(item.find("a").attr("href"), response.url).href,
			pubDate: parseDate(item.find("span").text().replaceAll("[]", ""))
		};
	});
	await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (!item.link.startsWith(`${baseUrl}/`)) return item;
		item.description = load((await got_default(item.link)).data)(".TRS_Editor").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link: `${baseUrl}/${path}`,
		item: items
	};
}
//#endregion
export { route };
