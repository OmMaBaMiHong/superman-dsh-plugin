import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/0x80/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/0x80/blog",
	url: "0x80.pl/notesen.html",
	name: "Articles",
	maintainers: ["xnum"],
	handler
};
function extractDateFromURL(url) {
	const match = url.match(/\d{4}-\d{2}-\d{2}/);
	return match ? match[0] : null;
}
async function handler() {
	const baseUrl = "http://0x80.pl/";
	const targetUrl = `${baseUrl}notesen.html`;
	const $ = load((await got_default({
		method: "get",
		url: targetUrl
	})).data);
	const list = $("a.reference.external").toArray().map((item) => {
		item = $(item);
		const link = item.attr("href") || "";
		return {
			title: item.text() || "",
			link,
			pubDate: extractDateFromURL(link),
			category: "Uncategoried"
		};
	}).filter((item) => item.link.startsWith("notesen"));
	return {
		title: "0x80.pl articles",
		link: targetUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: `${baseUrl}${item.link}`
			})).data);
			const author = $("tr.author.field td.field-body").text();
			const articlePubDate = $("tr.added-on.field td.field-body").text();
			item.author = author;
			item.pubDate = parseDate(item.pubDate || articlePubDate);
			item.description = $("div.document").first().html();
			return item;
		})))
	};
}
//#endregion
export { route };
