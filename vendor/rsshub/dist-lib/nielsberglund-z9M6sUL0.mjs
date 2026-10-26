import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nielsberglund/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/nielsberglund/blog",
	radar: [{ source: ["nielsberglund.com/"] }],
	url: "nielsberglund.com/",
	name: "Blog",
	maintainers: ["liyaozhong"],
	handler,
	description: "Niels Berglund Blog Posts"
};
async function handler() {
	const rootUrl = "https://nielsberglund.com";
	const $ = load((await got_default(rootUrl)).data);
	let items = $(".post-preview").toArray().map((item) => {
		const $item = $(item);
		const href = $item.find("a").first().attr("href");
		const title = $item.find(".post-title").first().text().trim();
		const dateStr = $item.find(".post-meta").text().trim();
		if (!href || !title) return null;
		return {
			title,
			link: new URL(href, rootUrl).href,
			pubDate: parseDate(dateStr)
		};
	}).filter((item) => item !== null);
	items = (await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)(".post-container").html() || "";
			return item;
		} catch {
			return item;
		}
	})))).filter((item) => item !== null);
	return {
		title: "Niels Berglund Blog",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
