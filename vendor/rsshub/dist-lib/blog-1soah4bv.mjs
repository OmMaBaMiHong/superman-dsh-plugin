import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/humanlayer/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/humanlayer/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.humanlayer.dev/blog"],
		target: "/humanlayer/blog"
	}],
	name: "Blog",
	maintainers: ["zj1123581321"],
	handler,
	url: "www.humanlayer.dev/blog"
};
async function handler() {
	const baseUrl = "https://www.humanlayer.dev";
	const listUrl = `${baseUrl}/blog`;
	const $ = load(await rofetch(listUrl));
	const list = $("a.block.py-2.group[href^=\"/blog/\"]").toArray().map((el) => {
		const $el = $(el);
		const href = $el.attr("href");
		const title = $el.find("h2").text().trim();
		const metaLine = $el.find("p.text-sm").text().trim();
		const description = $el.find("p[style]").text().trim();
		const parts = metaLine.split("·").map((s) => s.trim());
		const author = parts[0] || "";
		const dateStr = parts[1] || "";
		const category = parts[3]?.match(/#[\w-]+/g)?.map((t) => t.slice(1));
		return {
			title,
			link: `${baseUrl}${href}`,
			author,
			description,
			pubDate: dateStr ? parseDate(dateStr) : void 0,
			category
		};
	});
	return {
		title: "HumanLayer Blog",
		link: listUrl,
		language: "en",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $detail = load(await rofetch(item.link));
			const ogTitle = $detail("meta[property=\"og:title\"]").attr("content");
			const ogDesc = $detail("meta[property=\"og:description\"]").attr("content");
			const publishedTime = $detail("meta[property=\"article:published_time\"]").attr("content");
			const ogAuthor = $detail("meta[property=\"article:author\"]").attr("content");
			const ogImage = $detail("meta[property=\"og:image\"]").attr("content");
			const content = $detail("div.prose").html();
			return {
				...item,
				title: ogTitle || item.title,
				description: content || ogDesc || item.description,
				pubDate: publishedTime ? parseDate(publishedTime) : item.pubDate,
				author: ogAuthor || item.author,
				banner: ogImage
			};
		})))
	};
}
//#endregion
export { route };
