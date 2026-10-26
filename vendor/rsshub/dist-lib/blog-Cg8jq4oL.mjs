import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ceph/blog.ts
const route = {
	path: "/blog/:topic?",
	categories: ["blog"],
	example: "/ceph/blog/a11y",
	parameters: { category: "filter blog post by category, return all posts if not specified" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ceph.io/"] }],
	name: "Blog",
	maintainers: ["pandada8"],
	handler,
	url: "ceph.io"
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	const url = category ? `https://ceph.io/en/news/blog/category/${category}/` : "https://ceph.io/en/news/blog/";
	const data = (await got_default.get(url)).data;
	const $ = load(data);
	const list = $("#main .section li").toArray().map((e) => {
		const element = $(e);
		const title = element.find("a").text().trim();
		const pubDate = parseDate(element.find("time").attr("datetime"));
		return {
			title,
			link: new URL(element.find("a").attr("href"), "https://ceph.io").href,
			pubDate
		};
	});
	return {
		title: "Ceph Blog",
		link: url,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const data = (await got_default.get(item.link)).data;
			const item$ = load(data);
			item.author = item$("#main section > div:nth-child(1) span").text().trim();
			item.description = item$("#main section > div:nth-child(2) > div").html();
			return item;
		})))
	};
}
//#endregion
export { route };
