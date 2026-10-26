import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/nextjs/blog.ts
const handler = async () => {
	const $ = load(await rofetch("https://nextjs.org/blog"));
	return {
		title: "Next.js Blog",
		link: "https://nextjs.org/blog",
		language: "en-US",
		item: await Promise.all($("article").toArray().slice(0, 20).map((item) => {
			const link = `https://nextjs.org${load(item)("a[href^=\"/blog\"]").attr("href")}`;
			return cache_default.tryGet(`nextjs:blog:${link}`, async () => {
				const $ = load(await rofetch(link));
				return {
					title: $("h1").first().text().trim(),
					link,
					description: $("div.prose").html() ?? "",
					pubDate: parseDate($("p[data-version=\"v1\"]").first().text().replace(/st|nd|rd|th/, ""))
				};
			});
		}))
	};
};
const route = {
	path: "/blog",
	name: "Blog",
	categories: ["program-update"],
	maintainers: ["equt"],
	example: "/nextjs/blog",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler
};
//#endregion
export { route };
