import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/thzt/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/thzt/blog",
	url: "thzt.github.io",
	name: "Blog",
	maintainers: ["jihuayu"],
	handler
};
const author = "何幻";
async function handler() {
	const baseUrl = "https://thzt.github.io";
	const targetUrl = `${baseUrl}/archives/`;
	const $ = load((await got_default({
		method: "get",
		url: targetUrl
	})).data);
	const list = $("a.post-title-link").toArray().map((item) => {
		const element = $(item);
		const link = element.attr("href") || "";
		return {
			title: element.find("span").first().text() || "",
			link
		};
	});
	return {
		title: "thzt articles",
		link: targetUrl,
		item: await Promise.all(list.slice(0, 15).map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: `${baseUrl}/${item.link}`
			})).data);
			const articlePubDate = $("span.post-time > time").text();
			item.author = author;
			item.pubDate = parseDate(articlePubDate);
			item.description = $("div.post-body").first().html() || "";
			item.category = [$("span.post-category>span>a>span").first().text()];
			return item;
		})))
	};
}
//#endregion
export { route };
