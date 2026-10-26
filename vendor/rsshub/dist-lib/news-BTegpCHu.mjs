import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/fastbull/news.tsx
const route = {
	path: "/news",
	categories: ["finance"],
	view: 0,
	example: "/fastbull/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fastbull.com/cn/news", "fastbull.com/cn"] }],
	name: "News",
	maintainers: ["nczitzk"],
	handler,
	url: "fastbull.com/news"
};
async function handler() {
	const rootUrl = "https://www.fastbull.com";
	const currentUrl = `${rootUrl}/cn/news`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".trending_type").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text(),
			link: `${rootUrl}${item.attr("href")}`,
			author: item.find(".resource").text(),
			description: item.find(".tips").text(),
			pubDate: parseDate(Number.parseInt(item.find(".new_time").attr("data-date")))
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailHtml = load((await got_default({
			method: "get",
			url: item.link
		})).data)(".news-detail-content").html();
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [item.description ? /* @__PURE__ */ jsxs(Fragment, { children: [
			/* @__PURE__ */ jsx("b", { children: "摘要" }),
			"：",
			/* @__PURE__ */ jsx("p", { children: item.description })
		] }) : null, detailHtml ? raw(detailHtml) : null] }));
		return item;
	})));
	return {
		title: "财经头条、财经新闻、最新资讯 - FastBull",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
