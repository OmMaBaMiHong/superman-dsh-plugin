import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as ConfigNotFoundError } from "./config-not-found-fQ5mxvDU.mjs";
import { t as getHeaders } from "./utils-B0H7APTF2.mjs";
import { load } from "cheerio";
//#region lib/routes/smzdm/haowen-fenlei.ts
const route = {
	path: "/haowen/fenlei/:name/:sort?",
	categories: ["shopping"],
	example: "/smzdm/haowen/fenlei/shenghuodianqi",
	parameters: {
		name: "分类名，可在 URL 中查看",
		sort: "排序方式，默认为最新"
	},
	features: {
		requireConfig: [{
			name: "SMZDM_COOKIE",
			description: "什么值得买登录后的 Cookie 值"
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["post.smzdm.com/fenlei/:name"],
		target: "/haowen/fenlei/:name"
	}],
	name: "好文分类",
	maintainers: ["LogicJake"],
	handler,
	description: `| 最新 | 周排行 | 月排行 |
| ---- | ------ | ------ |
| 0    | 7      | 30     |`
};
async function handler(ctx) {
	if (!config.smzdm.cookie) throw new ConfigNotFoundError("什么值得买排行榜 is disabled due to the lack of SMZDM_COOKIE");
	const name = ctx.req.param("name");
	const sort = ctx.req.param("sort") || "0";
	const link = sort === "0" ? `https://post.smzdm.com/fenlei/${name}/` : `https://post.smzdm.com/fenlei/${name}/hot_${sort}/`;
	const $ = load((await got_default.get(link, { headers: getHeaders() })).data);
	const title = $("div.crumbs.nav-crumbs").text().split(">").pop();
	const list = $("div.list.post-list").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("h2.item-name a").text(),
			link: item.find("h2.item-name a").attr("href"),
			description: item.find(".item-info").html(),
			author: item.find(".nickname").text(),
			pubDate: timezone(parseDate(item.find("span.time").text(), [
				"HH:mm",
				"MM-DD HH:mm",
				"YYYY-MM-DD HH:mm"
			]), 8)
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link, { headers: getHeaders() })).data);
			item.description = $("article").html();
			item.pubDate = timezone(parseDate($("meta[property=\"og:release_date\"]").attr("content")), 8);
			item.author = $("meta[property=\"og:author\"]").attr("content");
		} catch {}
		return item;
	})));
	return {
		title: `${title}- 什么值得买好文分类`,
		link,
		item: out
	};
}
//#endregion
export { route };
