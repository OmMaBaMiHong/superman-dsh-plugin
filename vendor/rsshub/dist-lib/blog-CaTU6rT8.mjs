import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/njuferret/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/njuferret/blog",
	radar: [{ source: ["njuferret.github.io"] }],
	name: "Blogs",
	maintainers: ["tyl0622"],
	handler
};
async function handler() {
	const baseUrl = "https://njuferret.github.io";
	const $ = load(await rofetch(baseUrl));
	return {
		title: "njuferret - blog",
		item: $("div.post-block").toArray().map((item) => {
			item = $(item);
			const a = item.find("a").first();
			return {
				title: a.text(),
				link: `${baseUrl}${a.attr("href")}`,
				pubDate: parseDate(item.find("time").attr("datetime"))
			};
		})
	};
}
//#endregion
export { route };
