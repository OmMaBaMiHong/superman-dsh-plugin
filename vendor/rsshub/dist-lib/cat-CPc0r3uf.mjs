import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as fetchArticle } from "./utils-BIZ8as6D.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/bjnews/cat.ts
const route = {
	path: "/cat/:cat",
	categories: ["traditional-media"],
	example: "/bjnews/cat/depth",
	parameters: { cat: "分类, 可从URL中找到" },
	features: {},
	radar: [{ source: ["www.bjnews.com.cn/:cat"] }],
	name: "分类",
	maintainers: ["dzx-dzx"],
	handler,
	url: "www.bjnews.com.cn"
};
async function handler(ctx) {
	const url = `https://www.bjnews.com.cn/${ctx.req.param("cat")}`;
	const $ = load(await rofetch(url));
	const out = await pMap($("#waterfall-container .pin_demo > a").toArray().slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15).map((a) => ({
		title: $(a).text(),
		link: $(a).attr("href"),
		category: $(a).parent().find(".source").text().trim()
	})), (item) => fetchArticle(item), { concurrency: 2 });
	return {
		title: `新京报 - 分类 - ${$(".cur").text().trim()}`,
		link: url,
		item: out
	};
}
//#endregion
export { route };
