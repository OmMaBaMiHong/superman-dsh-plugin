import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/unipd/ilbolive/news.ts
const route = {
	path: "/ilbolive/news",
	name: "Il Bo Live - News",
	url: "ilbolive.unipd.it/it/news",
	maintainers: ["Gexi0619"],
	example: "/unipd/ilbolive/news",
	parameters: {},
	description: "Il Bo Live - News",
	categories: ["university"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ilbolive.unipd.it/it/news"],
		target: "/ilbolive/news"
	}],
	handler
};
async function handler() {
	const baseUrl = "https://ilbolive.unipd.it";
	const homeUrl = `${baseUrl}/it/news`;
	const $ = load((await got_default(homeUrl)).data);
	const items = $("#list-nodes .col.-s-6").toArray().map((el) => {
		const item = $(el);
		const title = item.find(".title a").text().trim();
		const href = item.find(".title a").attr("href");
		const link = baseUrl + href;
		const category = item.find(".category").text().trim();
		const image = item.find(".photo img").attr("src");
		return {
			title,
			link,
			category,
			enclosure_url: baseUrl + image,
			enclosure_type: "image/jpeg"
		};
	});
	return {
		title: "Il Bo Live - News",
		link: homeUrl,
		item: await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			const article = $("article.post-generic");
			article.find("img").each((_, el) => {
				const img = $(el);
				const src = img.attr("src");
				if (src && src.startsWith("/")) img.attr("src", baseUrl + src);
				img.attr("style", "max-width: 100%; height: auto;");
			});
			const datetime = article.find("time.date").attr("datetime");
			const pubDate = datetime ? timezone(parseDate(datetime), 0) : void 0;
			const author = article.find(".author a").text().trim();
			article.find(".header").remove();
			return {
				...item,
				description: article.html() ?? "",
				pubDate,
				author
			};
		}))),
		language: "it"
	};
}
//#endregion
export { route };
