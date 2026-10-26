import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as fetchArticle } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/sjtu/yzb/zkxx.ts
const baseTitle = "上海交通大学研究生招生网招考信息";
const baseUrl = "https://yzb.sjtu.edu.cn/index/zkxx/";
const route = {
	path: "/yzb/zkxx/:type",
	categories: ["university"],
	example: "/sjtu/yzb/zkxx/sszs",
	parameters: { type: "无默认选项" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生招生网招考信息",
	maintainers: ["stdrc"],
	handler,
	description: `| 博士招生 | 硕士招生 | 港澳台招生 | 考点信息 | 院系动态 |
| -------- | -------- | ---------- | -------- | -------- |
| bszs     | sszs     | gatzs      | kdxx     | yxdt     |`
};
async function handler(ctx) {
	const pageUrl = `${baseUrl}${ctx.req.param("type")}.htm`;
	const $ = load(await rofetch(pageUrl));
	const list = $("li[id^=\"line\"] a").toArray().map((elem) => ({
		link: new URL(elem.attribs.href, pageUrl).href,
		title: $(elem).text(),
		pubDate: parseDate($(elem.next?.next).text().trim())
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (new URL(item.link).hostname === "mp.weixin.qq.com") return await fetchArticle(item.link);
		if (new URL(item.link).hostname === "www.shmeea.edu.cn") {
			item.description = load(await rofetch(item.link.replace("http://", "https://")))(".Article_content").html();
			return item;
		}
		if (new URL(item.link).hostname === "yzb.sjtu.edu.cn") {
			item.description = load(await rofetch(item.link))("[id^=vsb_content]").html();
			return item;
		}
		return item;
	})));
	return {
		link: pageUrl,
		title: `${baseTitle} -- ${$("title").text().split("-", 1)[0]}`,
		item: items
	};
}
//#endregion
export { route };
