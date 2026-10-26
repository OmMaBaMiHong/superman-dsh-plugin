import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/google/research.ts
const baseUrl = "https://research.google";
const route = {
	path: "/research",
	categories: ["blog"],
	example: "/google/research",
	name: "Research Blog",
	maintainers: ["Levix", "cscnk52"],
	radar: [{ source: ["research.google"] }],
	handler: async () => {
		const $ = load(await rofetch(`${baseUrl}/blog`));
		const list = $("div.js-configurable-list .blog-posts-grid__cards .glue-grid__col").toArray().map((eleItem) => {
			const item = $(eleItem);
			const a = item.find("a").first();
			return {
				title: a.find(".headline-5").text(),
				link: `${baseUrl}${a.attr("href")}`,
				pubDate: parseDate(item.find(".glue-label.glue-spacer-1-bottom").text()),
				author: "Google",
				category: item.find(".not-glue.caption").toArray().map((item) => $(item).text().replace("·", "").trim())
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))(".blog-detail-wrapper.js-gt-blog-detail-wrapper").html();
			return item;
		})));
		return {
			title: "Google Research Blog",
			link: `${baseUrl}/blog`,
			item: items
		};
	}
};
//#endregion
export { route };
