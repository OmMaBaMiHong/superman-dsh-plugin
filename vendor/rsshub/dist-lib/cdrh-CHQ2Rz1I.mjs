import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fda/cdrh.ts
const route = {
	path: "/cdrh/:titleOnly?",
	radar: [{
		source: ["fda.gov/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates", "fda.gov/"],
		target: "/cdrh/:titleOnly"
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "fda.gov/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates"
};
async function handler(ctx) {
	const titleOnly = !!(ctx.req.param("titleOnly") ?? "");
	const rootUrl = "https://www.fda.gov";
	const currentUrl = `${rootUrl}/medical-devices/news-events-medical-devices/cdrhnew-news-and-updates`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $("div[role=\"main\"] a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).toArray().map((item) => {
		item = $(item);
		const link = item.attr("href");
		return {
			title: item.text(),
			link: link.startsWith("http") ? link : `${rootUrl}${link}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(titleOnly ? `${item.link}#${item.title}#titleOnly` : `${item.link}#${item.title}`, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.author = content("meta[property=\"article:publisher\"]").attr("content");
		try {
			item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content").split(", ").pop(), "MM/DD/YYYY - HH:mm");
		} catch {
			item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content"));
		}
		item.description = titleOnly ? null : content("div[role=\"main\"], .doc-content-area").html();
		item.guid = titleOnly ? `${item.link}#${item.title}#titleOnly` : `${item.link}#${item.title}`;
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
