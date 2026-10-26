import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/anthropic/engineering.ts
const route = {
	path: "/engineering",
	categories: ["programming"],
	example: "/anthropic/engineering",
	parameters: {},
	radar: [{ source: ["www.anthropic.com/engineering", "www.anthropic.com"] }],
	name: "Engineering",
	maintainers: ["TonyRL"],
	handler,
	url: "www.anthropic.com/engineering"
};
async function handler(ctx) {
	const baseUrl = "https://www.anthropic.com";
	const link = `${baseUrl}/engineering`;
	const $ = load(await rofetch(link));
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20;
	const items = await pMap($("a[class*=\"cardLink\"]").toArray().map((element) => {
		const $e = $(element);
		const href = $e.attr("href") ?? "";
		const fullLink = href.startsWith("http") ? href : `${baseUrl}${href}`;
		const pubDate = $e.find("div[class*=\"date\"]").text().trim();
		return {
			title: $e.find("h2, h3").text().trim(),
			link: fullLink,
			pubDate
		};
	}).filter((item) => item.title && item.link).slice(0, limit), (item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		const content = $("article > div > div[class*=\"__body\"]");
		content.find("img").each((_, e) => {
			const $e = $(e);
			$e.removeAttr("style srcset");
			const src = $e.attr("src");
			const newSrc = new URLSearchParams(src).get("/_next/image?url");
			if (newSrc) $e.attr("src", newSrc);
		});
		item.description = content.html() ?? void 0;
		return item;
	}), { concurrency: 5 });
	return {
		title: "Anthropic Engineering",
		link,
		description: "Latest engineering posts from Anthropic",
		image: `${baseUrl}/images/icons/apple-touch-icon.png`,
		item: items
	};
}
//#endregion
export { route };
