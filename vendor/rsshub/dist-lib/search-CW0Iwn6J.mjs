import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/baidu/search.tsx
const renderDescription = (description, images) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description ? raw(description) : null, images?.map((image) => /* @__PURE__ */ jsx("img", { src: image }))] }));
const route = {
	path: "/search/:keyword",
	categories: ["other"],
	example: "/baidu/search/rss",
	parameters: { keyword: "搜索关键词" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "搜索",
	maintainers: ["CaoMeiYouRen"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const url = `https://www.baidu.com/s?wd=${encodeURIComponent(keyword)}`;
	const key = `baidu-search:${url}`;
	const items = await cache_default.tryGet(key, async () => {
		const response = (await got_default(url)).data;
		const visitedLinks = /* @__PURE__ */ new Set();
		const $ = load(response);
		return $("#content_left").find(".c-container").toArray().map((el) => {
			const element = $(el);
			const link = element.find("h3 a").first().attr("href");
			if (link && !visitedLinks.has(link)) {
				visitedLinks.add(link);
				const imgs = element.find("img").toArray().map((_el) => $(_el).attr("src"));
				const description = element.find(".c-gap-top-small [class^=\"content-right_\"]").first().text() || element.find(".c-row").first().text() || element.find(".cos-row").first().text();
				return {
					title: element.find("h3").first().text(),
					description: renderDescription(description, imgs),
					link: element.find("h3 a").first().attr("href"),
					author: element.find(".c-row .c-color-gray").first().text() || ""
				};
			}
			return null;
		}).filter((e) => e?.link);
	}, config.cache.routeExpire, false);
	return {
		title: `${keyword} - 百度搜索`,
		description: `${keyword} - 百度搜索`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
