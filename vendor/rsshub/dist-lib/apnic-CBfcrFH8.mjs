import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/apnic/index.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/apnic/blog",
	url: "blog.apnic.net",
	name: "Blog",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://blog.apnic.net";
	const $ = load((await got_default(`${baseUrl}/feed/`)).data, { xmlMode: true });
	const list = $("item").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.find("title").text(),
			link: $item.find("link").text(),
			author: $item.find(String.raw`dc\:creator`).text(),
			category: $item.find("category").text().match(/>([^<]+)</)?.[1] || "",
			pubDate: parseDate($item.find("pubDate").text())
		};
	});
	return {
		title: "APNIC Blog",
		link: baseUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: articleData } = await got_default(item.link);
			item.description = load(articleData)(".entry-content").html();
			return item;
		})))
	};
}
//#endregion
export { route };
