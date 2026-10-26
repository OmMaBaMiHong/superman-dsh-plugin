import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/hrbeu/job/list.ts
const rootUrl = "http://job.hrbeu.edu.cn";
const idMap = {
	tzgg: {
		name: "通知公告",
		url: "http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smMlyGfDy8QefMwSyc-jK8Ww=.shtml"
	},
	rdxw: {
		name: "热点新闻",
		url: "http://job.hrbeu.edu.cn/HrbeuJY/Web/Home/NewsList?43kuJdqqW6kyCmomBv0smLeM5XMyxaJMXP0thrbMBWI=.shtml"
	}
};
const route = {
	path: "/job/list/:id",
	categories: ["university"],
	example: "/hrbeu/job/list/tzgg",
	parameters: { id: "栏目，如下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "就业服务平台",
	maintainers: ["Derekmini"],
	description: `| 通知公告 | 热点新闻 |
| :------: | :------: |
|   tzgg   |   rdxw   |`,
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const $ = load((await got_default(idMap[id].url, { headers: { Referer: rootUrl } })).data);
	const list = $("li.list_item.i1").toArray().map((item) => {
		let link = $(item).find("a").attr("href");
		if (link.includes("HrbeuJY")) link = `${rootUrl}${link}`;
		return {
			title: $(item).find("a").attr("title"),
			pubDate: parseDate($(item).find(".Article_PublishDate").text()),
			link
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes("HrbeuJY")) item.description = load((await got_default(item.link)).data)(".article").html();
		else if (new URL(item.link).hostname === "mp.weixin.qq.com") await finishArticleItem(item);
		else item.description = "本文需跳转，请点击标题后阅读";
		return item;
	})));
	return {
		title: "就业服务平台-" + idMap[id].name,
		link: idMap[id].url,
		item: items
	};
}
//#endregion
export { route };
