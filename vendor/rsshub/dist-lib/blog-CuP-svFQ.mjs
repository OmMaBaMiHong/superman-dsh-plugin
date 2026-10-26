import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/bvisness/blog.ts
const route = {
	name: "Blog",
	categories: ["blog"],
	maintainers: ["raxod502"],
	path: "/blog",
	example: "/bvisness/blog",
	handler,
	radar: [{
		source: ["bvisness.me"],
		target: "/blog"
	}]
};
async function handler() {
	const $ = load(await rofetch("https://bvisness.me/"));
	return {
		title: "Ben Visness Blog",
		link: "https://bvisness.me/",
		item: $("article").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").first();
			return {
				title: a.text(),
				link: new URL(a.attr("href"), "https://bvisness.me/").href,
				pubDate: parseDate(item.find("time").attr("datetime"))
			};
		})
	};
}
//#endregion
export { route };
