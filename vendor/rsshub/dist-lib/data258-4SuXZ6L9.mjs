import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as RequestInProgressError } from "./request-in-progress-BjSkP8tJ.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as wait } from "./wait-Do273esS.mjs";
import { r as finishArticleItem } from "./wechat-mp-D2I-Y5FJ.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/data258.ts
const parsePage = ($item, hyperlinkSelector, timeSelector) => {
	const hyperlink = $item.find(hyperlinkSelector);
	return {
		title: hyperlink.text(),
		link: hyperlink.attr("href"),
		pubDate: timezone(parseDate($item.find(timeSelector).text(), "YYYY-MM-DD HH:mm"), 8)
	};
};
const route = {
	path: "/data258/:id?",
	radar: [{ source: ["mp.data258.com/", "mp.data258.com/article/category/:id"] }],
	name: "Unknown",
	maintainers: ["Rongronggg9"],
	handler,
	url: "mp.data258.com/"
};
async function handler(ctx) {
	if (await cache_default.get("data258:lock", false) === "1") throw new RequestInProgressError("Another request is in progress, please try again later.");
	const id = ctx.req.param("id");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 5;
	const rootUrl = "https://mp.data258.com";
	const pageUrl = id ? `${rootUrl}/article/category/${id}` : rootUrl;
	const $ = load((await got_default(pageUrl)).data);
	const title = $("head title").text();
	const description = $("meta[name=\"description\"]").attr("content");
	const categoryPage = $("ul.fly-list");
	let items = categoryPage && categoryPage.length ? $(categoryPage).find("li").toArray().map((item) => parsePage($(item), "h2 a", ".fly-list-info span")) : $("ul.jie-row li").toArray().map((item) => parsePage($(item), "a.jie-title", ".layui-hide-xs"));
	items = items.slice(0, limit);
	if (await cache_default.get("data258:lock", false) === "1") throw new RequestInProgressError("Another request is in progress, please try again later.");
	await cache_default.set("data258:lock", "1", 60);
	let err;
	for (const item of items) {
		const cacheId = item.link.match(/id=([\da-f]+)/)[1];
		item.link = item.link.startsWith("http") ? item.link : `${rootUrl}${item.link}`;
		const realLink = await cache_default.tryGet(`data258:${cacheId}`, async () => {
			try {
				await wait(1e3);
				const response = await got_default.get(item.link, { headers: { Referer: pageUrl } });
				if (response.data.includes("今日浏览次数已达上限")) {
					err = new got_default.RequestError(response.data, {}, response.request);
					return null;
				}
				const $ = load(response.data);
				return $("script").filter((_, e) => $(e).html().includes("location.href")).html().match(/location\.href='([^']+)'/)[1];
			} catch (error) {
				err = error;
				return null;
			}
		});
		if (realLink) item.link = realLink;
		else break;
	}
	await cache_default.set("data258:lock", "0", 1);
	items = items.filter((item) => item.link.match(/^https?:\/\/mp\.weixin\.qq\.com\/s/));
	if (items.length === 0 && err) throw err;
	await Promise.all(items.map((item) => finishArticleItem(item, !!categoryPage)));
	return {
		title,
		link: pageUrl,
		description,
		item: items
	};
}
//#endregion
export { route };
