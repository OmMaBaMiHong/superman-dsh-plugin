import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/damai/activity.tsx
const route = {
	path: "/activity/:city/:category/:subcategory/:keyword?",
	categories: ["shopping"],
	example: "/damai/activity/上海/音乐会/全部/柴可夫斯基",
	parameters: {
		city: "城市，如果不需要限制，请填入`全部`",
		category: "分类，如果不需要限制，请填入`全部`",
		subcategory: "子分类，如果不需要限制，请填入`全部`",
		keyword: "搜索关键字，置空为不限制"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "票务更新",
	maintainers: ["hoilc", "Konano"],
	handler,
	description: "城市、分类名、子分类名，请参见[大麦网搜索页面](https://search.damai.cn/search.htm)"
};
async function handler(ctx) {
	const city = ctx.req.param("city") === "全部" ? "" : ctx.req.param("city");
	const category = ctx.req.param("category") === "全部" ? "" : ctx.req.param("category");
	const subcategory = ctx.req.param("subcategory") === "全部" ? "" : ctx.req.param("subcategory");
	const keyword = ctx.req.param("keyword") ?? "";
	const list = (await got_default("https://search.damai.cn/searchajax.html", { searchParams: {
		keyword,
		cty: city,
		ctl: category,
		sctl: subcategory,
		tsg: 0,
		st: "",
		et: "",
		order: 3,
		pageSize: 30,
		currPage: 1,
		tn: ""
	} })).data.pageData.resultData || [];
	return {
		title: `大麦网票务 - ${city || "全国"} - ${category || "全部分类"}${subcategory ? " - " + subcategory : ""}${keyword ? " - " + keyword : ""}`,
		link: "https://search.damai.cn/search.htm",
		allowEmpty: true,
		item: list.map((item) => ({
			title: item.nameNoHtml,
			author: item.actors ? load(item.actors, null, false).text() : "大麦网",
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("img", { src: item.verticalPic }),
				/* @__PURE__ */ jsx("p", { children: item.description ? raw(item.description) : null }),
				/* @__PURE__ */ jsxs("p", { children: [
					"地点：",
					item.venuecity,
					" | ",
					item.venue
				] }),
				/* @__PURE__ */ jsxs("p", { children: ["时间：", item.showtime] }),
				/* @__PURE__ */ jsxs("p", { children: ["票价：", item.price_str] })
			] })),
			link: `https://detail.damai.cn/item.htm?id=${item.projectid}`
		}))
	};
}
//#endregion
export { route };
