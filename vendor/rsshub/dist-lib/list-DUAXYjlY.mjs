import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/sec/list.ts
const rootUrl = "http://sec.hrbeu.edu.cn";
const route = {
	path: "/sec/:id",
	categories: ["university"],
	example: "/hrbeu/sec/xshd",
	parameters: { id: "栏目编号，由 `URL` 中获取。" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sec.hrbeu.edu.cn/:id/list.htm"] }],
	name: "船舶工程学院",
	maintainers: ["Chi-hong22"],
	handler,
	description: `| 学院要闻 | 学术活动 | 通知公告 | 学科方向 |
| :------: | :------: | :------: | :------: |
|   xyyw   |   xshd   |    229   |   xkfx   |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(`${rootUrl}/${id}/list.htm`, { headers: { Referer: rootUrl } })).data);
	const bigTitle = $("div [class=lanmuInnerMiddleBigClass_right]").find("div [portletmode=simpleColumnAttri]").text().replaceAll(/[\s·]/g, "").trim();
	const list = $("li.list_item").toArray().map((item) => {
		let link = $(item).find("a").attr("href");
		if (link && link.includes("page.htm")) link = `${rootUrl}${link}`;
		return {
			title: $(item).find("a").attr("title"),
			pubDate: parseDate($(item).find("span.Article_PublishDate").text()),
			link
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes("page.htm")) item.description = load((await got_default(item.link)).data)("div.wp_articlecontent").html();
		else item.description = "本文需跳转，请点击标题后阅读";
		return item;
	})));
	return {
		title: "船舶工程学院 - " + bigTitle,
		link: rootUrl.concat("/", id, "/list.htm"),
		item: items
	};
}
//#endregion
export { route };
