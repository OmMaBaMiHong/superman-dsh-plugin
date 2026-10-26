import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hamel/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/hamel/blog",
	radar: [{ source: ["hamel.dev/"] }],
	url: "hamel.dev/",
	name: "Blog",
	maintainers: ["liyaozhong"],
	handler,
	description: "Hamel's Blog Posts"
};
async function handler() {
	const rootUrl = "https://hamel.dev";
	const $ = load((await got_default(rootUrl)).data);
	let items = $("tr[data-index]").toArray().map((item) => {
		const $item = $(item);
		const $link = $item.find("td a").last();
		const $date = $item.find(".listing-date");
		const href = $link.attr("href");
		const title = $link.text().trim();
		const dateStr = $date.text().trim();
		if (!href || !title || !dateStr) return null;
		return {
			title,
			link: new URL(href, rootUrl).href,
			pubDate: parseDate(dateStr, "M/D/YY")
		};
	}).filter((item) => item !== null);
	items = (await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $detail = load((await got_default(item.link)).data);
			return {
				...item,
				description: $detail(".content").html() || ""
			};
		} catch {
			return item;
		}
	})))).filter((item) => item !== null);
	return {
		title: "Hamel's Blog",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
