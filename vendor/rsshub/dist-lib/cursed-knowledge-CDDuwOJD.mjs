import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/immich/cursed-knowledge.ts
const route = {
	path: "/cursed-knowledge",
	categories: ["blog"],
	example: "/immich/cursed-knowledge",
	radar: [{
		source: ["immich.app/cursed-knowledge", "immich.app"],
		target: "/cursed-knowledge"
	}],
	name: "Cursed Knowledge",
	maintainers: ["TonyRL"],
	handler
};
async function handler() {
	const baseUrl = "https://immich.app";
	const link = `${baseUrl}/cursed-knowledge/`;
	const $ = load(await rofetch(link));
	const items = $("div.justify-around ul li").toArray().map((item) => {
		const $item = $(item);
		const href = $item.find("a").attr("href");
		const title = $item.find("section p").first().text();
		return {
			title,
			description: $item.find("section p").last().text(),
			link: href ?? `${link}#${title}`,
			pubDate: parseDate($item.find("div.justify-start").text())
		};
	});
	return {
		title: $("head title").text(),
		description: $("p.text-center").text(),
		image: `${baseUrl}${$("head link[rel=\"icon\"]").attr("href")}`,
		link,
		item: items
	};
}
//#endregion
export { route };
