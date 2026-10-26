import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bmkg/news.ts
const route = {
	path: "/news",
	categories: ["forecast"],
	example: "/bmkg/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bmkg.go.id/", "bmkg.go.id/berita"] }],
	name: "News",
	maintainers: ["Shinanory"],
	handler,
	url: "bmkg.go.id/"
};
async function handler() {
	const url = "https://www.bmkg.go.id";
	const $ = load((await got_default(url)).data);
	const list = $("div .ms-slide").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const img = item.find("img");
		return {
			title: a.text(),
			link: `${url}/${a.attr("href")}`,
			itunes_item_image: img.attr("data-src")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("div .blog-grid").find("p").text();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		description: "印尼气象气候和地球物理局 新闻 | BMKG news",
		item: items,
		language: "in"
	};
}
//#endregion
export { route };
