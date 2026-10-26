import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/usts/jwch.ts
const rootURL = "http://jwch.usts.edu.cn/index";
const route = {
	path: "/jwch/:type?",
	categories: ["university"],
	example: "/usts/jwch",
	parameters: { type: "类型，默认为教务动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: [],
	handler,
	description: `| 类型 | 教务动态 | 公告在线 | 选课通知 |
| ---- | -------- | -------- | -------- |
|      | jwdt     | ggzx     | xktz     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "jwdt";
	const url = `${rootURL}/${type}.htm`;
	const $ = load((await got_default(url)).data);
	const title = $("div.mainWrap.cleafix > div > div.right.fr > div.local.fl > h3").text();
	const list = $("div.list > ul > li").toArray().map((item) => ({
		title: $(item).find("a").text(),
		link: new URL($(item).find("a").attr("href"), rootURL).href
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		let author = null;
		let pubDate = null;
		for (const item of content("div.content-title.fl > i").text().split("\xA0\xA0")) {
			if (item.includes("作者：")) author = item.split("：", 2)[1];
			if (item.includes("时间：")) pubDate = item.split("：", 2)[1];
		}
		item.description = content("div#vsb_content").html();
		item.author = author;
		item.pubDate = timezone(parseDate(pubDate), 8);
		return item;
	})));
	return {
		title: `苏州科技大学 教务处 - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
