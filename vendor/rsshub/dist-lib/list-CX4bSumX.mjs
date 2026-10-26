import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/yjsy/list.ts
const rootUrl = "http://yjsy.hrbeu.edu.cn";
const route = {
	path: "/yjsy/list/:id",
	categories: ["university"],
	example: "/hrbeu/yjsy/list/2981",
	parameters: { id: "栏目编号，由 `URL` 中获取。" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yjsy.hrbeu.edu.cn/:id/list.htm"] }],
	name: "研究生院",
	maintainers: ["Derekmini"],
	handler,
	description: `| 通知公告 | 新闻动态 | 学籍注册 | 奖助学金 | 其他 |
| :------: | :------: | :------: | :------: | :--: |
|   2981   |   2980   |   3009   |   3011   |  ... |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(`${rootUrl}/${id}/list.htm`, { headers: { Referer: rootUrl } })).data);
	const bigTitle = $("div [id=lanmuInnerMiddleBigClass_right]").find("div [portletmode=simpleColumnAttri]").text().replaceAll(/[\t\n\r ·]/g, "").trim();
	const list = $("li.list_item").toArray().map((item) => {
		let link = $(item).find("a").attr("href");
		if (link.includes("page.htm")) link = `${rootUrl}${link}`;
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
		title: "研究生院-" + bigTitle,
		link: rootUrl.concat("/", id, "/list.htm"),
		item: items
	};
}
//#endregion
export { route };
