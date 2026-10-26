import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bnu/bs.ts
const route = {
	path: "/bs/:category?",
	categories: ["university"],
	example: "/bnu/bs",
	parameters: { category: "分类，见下表，默认为学院新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["bs.bnu.edu.cn/:category/index.html"],
		target: "/bs/:category"
	}],
	name: "经济与工商管理学院",
	maintainers: ["nczitzk"],
	handler,
	description: `| 学院新闻 | 通知公告 | 学术成果 | 学术讲座 | 教师观点 | 人才招聘 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| xw       | zytzyyg  | xzcg     | xzjz     | xz       | bshzs    |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "xw";
	const rootUrl = "http://bs.bnu.edu.cn";
	const currentUrl = `${rootUrl}/${category}/index.html`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("a[title]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			pubDate: parseDate(item.prev().text()),
			link: `${rootUrl}/${category}/${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".right-c-content-con").html();
		return item;
	})));
	return {
		title: `${$(".right-c-title").text()} - ${$("title").text()}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
