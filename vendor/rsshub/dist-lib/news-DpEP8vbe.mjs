import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/uae/news.ts
const route = {
	path: "/uae/:id",
	categories: ["university"],
	example: "/hrbeu/uae/xwdt",
	parameters: { id: "栏目编号，在 `URL` 中获取，如果有多级编号，将 `/` 替换为 `-`。" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["uae.hrbeu.edu.cn/:id.htm"] }],
	name: "水声工程学院",
	maintainers: [],
	handler,
	description: `| 新闻动态 | 通知公告 | 科学研究 / 科研动态 |
| :------: | :------: | :-----------------: |
|   xwdt   |   tzgg   |      kxyj-kydt      |`
};
async function handler(ctx) {
	const id = ctx.req.param("id").replaceAll("-", "/");
	const host = "http://uae.hrbeu.edu.cn";
	const url = `${host}/${id}.htm`;
	const $ = load((await got_default(url, { headers: { Referer: host } })).data);
	const title = $("h2").text();
	const items = $("li.wow.fadeInUp").toArray().map((item) => {
		const title = $(item).find("a").attr("title");
		let link = $(item).find("a").attr("href");
		if (!link.startsWith("http")) link = `${host}/${link}`;
		return {
			title,
			pubDate: parseDate($(item).find("div.date").text().replaceAll(/(.*)\/(.*)/g, "$2-$1")),
			link
		};
	});
	const item = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "uae.hrbeu.edu.cn") item.description = load((await got_default(item.link)).data)("div.art-body").html();
		else if (new URL(item.link).hostname === "news.hrbeu.edu.cn") item.description = load((await got_default(item.link)).data)("div#print").html();
		else if (new URL(item.link).hostname === "mp.weixin.qq.com") await finishArticleItem(item);
		else item.description = "本文需跳转，请点击标题后阅读";
		return item;
	})));
	return {
		title: `水声工程学院 - ${title}`,
		link: url,
		item
	};
}
//#endregion
export { route };
