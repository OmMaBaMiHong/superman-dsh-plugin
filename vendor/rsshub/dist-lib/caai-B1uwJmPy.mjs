import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/caai/utils.tsx
const base = "http://www.caai.cn";
const urlBase = (caty) => `http://www.caai.cn/index.php?s=/home/article/index/id/${caty}.html`;
const renderDesc = (desc) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: desc ? raw(desc) : null }));
const detailPage = (e, cache) => cache.tryGet(e.link, async () => {
	e.description = load((await got_default(e.link)).data)("div.article").html();
	return e;
});
const fetchAllArticles = (data) => {
	const $ = load(data);
	return $("div.article-list > ul > li").toArray().map((e) => {
		const c = $(e);
		return {
			title: c.find("h3 a[href]").text().trim(),
			link: base + c.find("h3 a[href]").attr("href"),
			pubDate: timezone(parseDate(c.find("h4").text().trim(), "YYYY-MM-DD"), 8)
		};
	});
};
var utils_default = {
	BASE: base,
	urlBase,
	fetchAllArticles,
	detailPage,
	renderDesc
};
//#endregion
//#region lib/routes/caai/index.ts
const route = {
	path: "/:caty",
	categories: ["study"],
	example: "/caai/45",
	parameters: { caty: "分类 ID，可在 URL 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "学会动态",
	maintainers: ["tudou027"],
	handler
};
async function handler(ctx) {
	const base = utils_default.urlBase(ctx.req.param("caty"));
	const res = await got_default(base);
	const info = utils_default.fetchAllArticles(res.data);
	const $ = load(res.data);
	const details = await Promise.all(info.map((e) => utils_default.detailPage(e, cache_default)));
	ctx.set("json", { info });
	return {
		title: "中国人工智能学会 - " + $(".article-list h1").text(),
		link: base,
		item: details
	};
}
//#endregion
export { route };
