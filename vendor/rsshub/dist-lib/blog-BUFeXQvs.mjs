import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/samsung/research/blog.ts
const route = {
	path: "/research/blog",
	categories: ["new-media"],
	example: "/samsung/research/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["research.samsung.com/blog", "research.samsung.com/"] }],
	name: "Research Blog",
	maintainers: ["nczitzk"],
	handler,
	url: "research.samsung.com/blog"
};
async function handler() {
	const rootUrl = "https://research.samsung.com";
	let items = (await got_default({
		method: "post",
		url: `${rootUrl}/blogMain/list.json`,
		json: {
			currentPageNo: 0,
			endIndex: 9,
			startIndex: 0
		}
	})).data.value.map((item) => ({
		title: item.title,
		author: item.authorName,
		link: `${rootUrl}${item.urlLink}`,
		category: [
			item.catagoryCode,
			item.hashTag1,
			item.hashTag2
		],
		pubDate: parseDate(item.publicationDtsStr.replace(/On /, ""), "MMMM D, YYYY")
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".news-con").html();
		return item;
	})));
	return {
		title: "BLOG | Samsung Research",
		link: `${rootUrl}/blog`,
		item: items
	};
}
//#endregion
export { route };
