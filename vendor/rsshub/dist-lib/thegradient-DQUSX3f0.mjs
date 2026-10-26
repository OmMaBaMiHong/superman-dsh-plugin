import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/thegradient/index.ts
const route = {
	path: "/posts",
	categories: ["blog"],
	example: "/thegradient/posts",
	radar: [{ source: ["thegradient.pub/"] }],
	url: "thegradient.pub/",
	name: "Posts",
	maintainers: ["liyaozhong"],
	handler,
	description: "The Gradient Blog Posts"
};
async function handler() {
	const rootUrl = "https://thegradient.pub";
	const $ = load((await got_default(rootUrl)).data);
	let items = $(".c-post-card-wrap").toArray().map((item) => {
		const $item = $(item);
		const $link = $item.find(".c-post-card__title-link").first();
		const $meta = $item.find(".c-post-card__meta");
		const href = $link.attr("href");
		const title = $link.text().trim();
		const dateStr = $meta.find("time").attr("datetime");
		if (!href || !title || !dateStr) return null;
		return {
			title,
			link: new URL(href, rootUrl).href,
			pubDate: parseDate(dateStr)
		};
	}).filter((item) => item !== null);
	items = (await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			item.description = load((await got_default(item.link)).data)(".c-content").html() || "";
			return item;
		} catch {
			return item;
		}
	})))).filter((item) => item !== null);
	return {
		title: "The Gradient Blog",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
