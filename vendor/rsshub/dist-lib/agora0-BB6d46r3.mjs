import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/agora0/index.ts
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/agora0/initium",
	parameters: { category: "分类，见下表，默认为 initium，即端传媒" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["agora0.gitlab.io/blog/:category", "agora0.gitlab.io/"],
		target: "/:category"
	}],
	name: "零博客",
	maintainers: ["nczitzk"],
	handler,
	description: `| muitinⒾ | aidemnⒾ | srettaⓂ | qⓅ | sucoⓋ |
| ------- | ------- | ------- | -- | ----- |
| initium | inmedia | matters | pq | vocus |`
};
async function handler(ctx) {
	const currentUrl = `https://agora0.gitlab.io/blog/${ctx.req.param("category") ?? "initium"}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".card span:not(.comments) a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.author = content("meta[name=\"author\"]").attr("content");
		item.pubDate = parseDate(content("meta[property=\"article:published_time\"]").attr("content"));
		item.description = content(".post-content").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
