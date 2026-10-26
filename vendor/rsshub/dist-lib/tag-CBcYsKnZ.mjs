import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/wired/tag.ts
const route = {
	path: "/tag/:tag",
	example: "/wired/tag/facebook",
	parameters: { tag: "Tag name" },
	radar: [{ source: ["www.wired.com/tag/:tag/"] }],
	name: "Tags",
	maintainers: ["Naiqus"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.wired.com";
	const { tag } = ctx.req.param();
	const link = `${baseUrl}/tag/${tag}/`;
	const response = await rofetch(link);
	const $ = cheerio.load(response);
	const preloadedState = JSON.parse($("script:contains(\"window.__PRELOADED_STATE__\")").text().match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? "{}");
	const list = preloadedState.transformed.tag.items.map((item) => ({
		title: item.dangerousHed,
		description: item.dangerousDek,
		link: `${baseUrl}${item.url}`,
		pubDate: parseDate(item.date),
		author: item.contributors.author.items.map((author) => author.name).join(", "),
		category: [item.rubric.name]
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		const $ = cheerio.load(response);
		const preloadedState = JSON.parse($("script:contains(\"window.__PRELOADED_STATE__\")").text().match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? "{}");
		const headerLeadAsset = $("div[data-testid*=\"ContentHeaderLeadAsset\"]");
		headerLeadAsset.find("button").remove();
		if (headerLeadAsset.find("video")) {
			headerLeadAsset.find("video").attr("src", $("link[rel=\"preload\"][as=\"video\"]").attr("href"));
			headerLeadAsset.find("video").attr("controls", "");
			headerLeadAsset.find("video").attr("preload", "metadata");
			headerLeadAsset.find("video").removeAttr("autoplay");
		}
		const content = $(".body__inner-container").toArray().map((el) => {
			const $el = $(el);
			$el.find("noscript").each((_, el) => {
				const $e = $(el);
				$e.replaceWith($e.html() || "");
			});
			return $el.html();
		}).join("");
		item.description = ($("div[class^=ContentHeaderDek]").prop("outerHTML") || "") + headerLeadAsset.prop("outerHTML") + content;
		item.category = [.../* @__PURE__ */ new Set([...item.category, ...preloadedState.transformed.article.tagCloud.tags.map((t) => t.tag)])];
		return item;
	})));
	return {
		title: preloadedState.transformed["head.title"],
		description: preloadedState.transformed["head.description"],
		link,
		image: `${baseUrl}${preloadedState.transformed.logo.sources.sm.url}`,
		language: "en",
		item: items
	};
}
//#endregion
export { route };
