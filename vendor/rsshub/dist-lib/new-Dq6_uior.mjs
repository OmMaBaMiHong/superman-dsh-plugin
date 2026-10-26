import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/naturalism/new.ts
const route = {
	path: "/",
	categories: ["other"],
	example: "/naturalism",
	radar: [{ source: ["naturalism.org"] }],
	name: "What's New",
	maintainers: ["TonyRL"],
	handler,
	url: "naturalism.org"
};
async function handler() {
	const baseUrl = "https://naturalism.org";
	const $ = load(await rofetch(baseUrl));
	const list = $(".view-what-s-new .field-content a").toArray().map((element) => {
		const a = $(element);
		return {
			title: a.text(),
			link: new URL(a.attr("href"), baseUrl).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		$("#content").find("h1").remove();
		item.description = $("#content").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link: baseUrl,
		image: `${baseUrl}/sites/naturalism.org/files/swirl-logo.png`,
		item: items
	};
}
//#endregion
export { route };
