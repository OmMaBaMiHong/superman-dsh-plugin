import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/anthropic/news.ts
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/anthropic/news",
	parameters: {},
	radar: [{ source: ["www.anthropic.com/news", "www.anthropic.com"] }],
	name: "News",
	maintainers: ["etShaw-zh", "goestav"],
	handler,
	url: "www.anthropic.com/news"
};
async function handler(ctx) {
	const link = "https://www.anthropic.com/news";
	const $ = load(await rofetch(link));
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	return {
		title: "Anthropic News",
		link,
		description: "Latest news from Anthropic",
		item: await pMap($("[class^=\"PublicationList-module-scss-module__\"][class$=\"__list\"] a").toArray().slice(0, limit).map((el) => {
			const $el = $(el);
			const title = $el.find("[class*=\"__title\"]").text().trim();
			const href = $el.attr("href") ?? "";
			const pubDate = $el.find("time").text().trim();
			return {
				title,
				link: href.startsWith("http") ? href : `https://www.anthropic.com${href}`,
				pubDate
			};
		}), (item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			const content = $("#main-content");
			$("[class$=\"__header\"], [class$=\"__socialShare\"], [class*=\"__carousel-controls\"], [class^=\"LandingPageSection-module-scss-module__\"]").remove();
			content.find("img").each((_, e) => {
				const $e = $(e);
				$e.removeAttr("style srcset");
				const src = $e.attr("src");
				const newSrc = new URLSearchParams(src).get("/_next/image?url");
				if (newSrc) $e.attr("src", newSrc);
			});
			item.description = content.html() ?? void 0;
			return item;
		}), { concurrency: 5 })
	};
}
//#endregion
export { route };
