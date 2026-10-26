import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/distill/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["distill.pub/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "distill.pub/"
};
async function handler() {
	const rootUrl = "https://distill.pub";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	let items = $(".post-preview").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: `${rootUrl}/${item.children("a").attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("d-contents").remove();
		content("img").each((_, el) => {
			content(el).attr("src", `${item.link}/${content(el).attr("src")}`);
		});
		item.doi = content("meta[name=\"citation_doi\"]").attr("content");
		item.pubDate = parseDate(content("meta[property=\"article:published\"]").attr("content"));
		item.description = content("d-article").children().toArray().map((c) => content(c).html()).join("");
		item.author = content("meta[property=\"article:author\"]").toArray().map((author) => content(author).attr("content")).join(", ");
		return item;
	})));
	return {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
