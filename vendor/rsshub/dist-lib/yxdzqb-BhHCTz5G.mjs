import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/yxdzqb/index.tsx
const host = "https://www.yxdzqb.com";
const map = {
	new: "index_discount.html",
	hot: "index_popular.html",
	hot_chinese: "index_popular_cn.html",
	low: "index_low.html",
	low_chinese: "index_low_cn.html"
};
const route = {
	path: "/:type",
	categories: ["game"],
	example: "/yxdzqb/popular_cn",
	parameters: { type: "折扣类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yxdzqb.com/"] }],
	name: "游戏折扣",
	maintainers: ["LogicJake", "nczitzk"],
	handler,
	url: "yxdzqb.com/",
	description: `| Steam 最新折扣 | Steam 热门游戏折扣 | Steam 热门中文游戏折扣 | Steam 历史低价 | Steam 中文游戏历史低价 |
| -------------- | ------------------ | ---------------------- | -------------- | ---------------------- |
| discount       | popular            | popular\\_cn            | low            | low\\_cn                |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const link = `${host}/${Object.hasOwn(map, type) ? map[type] : `index_${type}.html`}`;
	const $ = load((await got_default.get(link)).data);
	const title = $(".btn-primary b").text() || $(".btn-danger b").text() || $(".btn-info b").text();
	const out = $("tr.bg-none").toArray().map((item) => {
		item = $(item);
		const title = item.find("div table:nth-child(1) tr td:nth-child(1)").text();
		const description = renderToString(/* @__PURE__ */ jsx(YxdzqbDescription, {
			src: item.find("table.cell_tabs > tbody > tr > td:nth-child(1) > img").attr("src"),
			description: item.find("div.collapse").html()
		}));
		const link = item.find("div.collapse table.cell_tabs > tbody > tr > td:nth-child(1) > a").attr("href");
		return {
			title,
			description,
			link,
			guid: link + item.find("div.cell_price span:nth-child(2)").text()
		};
	});
	return {
		title: `${title}-游戏打折情报`,
		link,
		item: out
	};
}
const YxdzqbDescription = ({ src, description }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src }), description ? raw(description) : null] });
//#endregion
export { route };
