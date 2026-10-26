import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qq88/index.ts
const route = {
	path: "/:category?",
	categories: ["multimedia"],
	example: "/qq88",
	parameters: { category: "分类 id，见下表，默认为首页" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 首页 | オトナの土ドラ | 日剧 | 日剧 SP |
| ---- | -------------- | ---- | ------- |
|      | 10             | 5    | 11      |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const rootUrl = "https://qq88.info";
	const currentUrl = category ? `${rootUrl}/?cat=${category}` : rootUrl;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".entry-title a").slice(0, 15).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href"),
			pubDate: parseDate(item.parent().next().find(".mh-meta-date").eq(-1).text().split("：", 2)[1])
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const links = content(".entry-content").find("a[download]");
		item.enclosure_type = "video/mp4";
		item.enclosure_url = links.eq(-1).attr("href");
		item.description = `<video controls><source src="${item.enclosure_url}"></video><br>`;
		links.each((_, el) => {
			item.description += `<li><a href="${content(el).attr("href")}">${content(el).text()}</a></li>`;
		});
		return item;
	})));
	return {
		title: `${$(".page-title").text() || "首页"} - 秋爸日字`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
