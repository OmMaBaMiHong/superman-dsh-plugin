import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nuist/jwc.ts
const baseUrl = "https://jwc.nuist.edu.cn";
const route = {
	path: "/jwc/:category?",
	categories: ["university"],
	example: "/nuist/jwc/jxyw",
	parameters: { category: "默认为教学要闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["gylidian"],
	handler,
	description: `| 教学要闻 | 学院教学 | 教务管理 | 教学研究 | 教务管理 | 教材建设 | 考试中心 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| jxyw     | xyjx     | jwgl     | jxyj     | sjjx     | jcjs     | kszx     |`
};
async function handler(ctx) {
	const { category = "jxyw" } = ctx.req.param();
	const link = `${baseUrl}/${category === "jxyw" || category === "xyjx" ? "index" : "xxtz"}/${category}.htm`;
	const $ = load((await got_default(link)).data);
	const list = $(".main_list ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").contents().first().text(),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".date").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#vsb_content").html();
		return item;
	})));
	return {
		title: "南京信息工程大学-教务处：" + $(".dqwz").find("a").eq(1).text(),
		link,
		item: items
	};
}
//#endregion
export { route };
