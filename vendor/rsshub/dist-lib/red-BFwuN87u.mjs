import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/anthropic/red.ts
const route = {
	path: "/red",
	categories: ["programming"],
	example: "/anthropic/red",
	radar: [{ source: ["red.anthropic.com"] }],
	name: "Frontier Red Team",
	maintainers: ["shoeper"],
	handler,
	url: "red.anthropic.com"
};
async function handler() {
	const baseUrl = "https://red.anthropic.com";
	const link = `${baseUrl}/red`;
	const $ = load(await rofetch(link));
	const items = await pMap($("a[class^=\"note\"]").toArray().map((element) => {
		const $e = $(element);
		return {
			title: $e.find("h2, h3").text().trim(),
			link: `${baseUrl}/${$e.attr("href")}`
		};
	}), (item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		item.pubDate = parseDate($("d-article p").first().text().trim());
		$("h3:contains(\"Subscribe\")").remove();
		$("d-article p").first().remove();
		const content = $("d-article");
		content.find("img").each((_, e) => {
			const $e = $(e);
			$e.removeAttr("style srcset");
			const src = $e.attr("src");
			const newSrc = new URLSearchParams(src).get("/_next/image?url");
			if (newSrc) $e.attr("src", newSrc);
		});
		item.description = content.html();
		return item;
	}), { concurrency: 5 });
	return {
		title: "Anthropic Frontier Red Team",
		link,
		image: `${baseUrl}/anthropic-serve/favicon.ico`,
		item: items
	};
}
//#endregion
export { route };
