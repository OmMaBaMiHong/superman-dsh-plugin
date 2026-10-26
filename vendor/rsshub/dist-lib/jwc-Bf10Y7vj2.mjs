import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xidian/jwc.ts
const baseUrl = "https://jwc.xidian.edu.cn";
const route = {
	path: "/jwc/:category?",
	categories: ["university"],
	example: "/xidian/jwc/tzgg",
	parameters: { category: "通知类别，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	url: "jwc.xidian.edu.cn",
	maintainers: ["ShadowySpirits"],
	handler,
	description: `| 教学信息 | 教学研究 | 实践教学 | 质量监控 | 通知公告 |
| :------: | :------: | :------: | :------: | :------: |
|   jxxx   |   jxyj   |   sjjx   |   zljk   |   tzgg   |`
};
async function handler(ctx) {
	const { category = "tzgg" } = ctx.req.param();
	const url = `${baseUrl}/${category}.htm`;
	const $ = load((await got_default(url, { headers: { referer: baseUrl } })).data);
	let items = $(".list ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".con span").text())
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link, { headers: { referer: url } })).data);
		content(".tit, .zd, #div_vote_id").remove();
		item.description = content(".con").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
