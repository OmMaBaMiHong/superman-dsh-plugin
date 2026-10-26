import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/harvard/health/blog.ts
const route = {
	path: "/health/blog",
	categories: ["new-media"],
	example: "/harvard/health/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.health.harvard.edu/blog"] }],
	name: "Health Blog",
	maintainers: ["nczitzk"],
	handler,
	url: "www.health.harvard.edu/blog"
};
async function handler() {
	const currentUrl = `https://www.health.harvard.edu/blog`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(String.raw`.lg\:text-2xl`).toArray().map((item) => {
		item = $(item).parent();
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	return {
		title: "Harvard Health Blog",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const ldJson = JSON.parse(content("script[type=\"application/ld+json\"]").text())["@graph"].find((i) => i["@type"] === "Article");
			item.description = content(".content-repository-content").html();
			item.pubDate = parseDate(ldJson.datePublished);
			item.author = ldJson.author.name;
			return item;
		})))
	};
}
//#endregion
export { route };
