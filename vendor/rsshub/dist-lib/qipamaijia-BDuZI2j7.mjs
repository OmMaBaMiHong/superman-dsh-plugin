import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qipamaijia/index.ts
const rootUrl = "https://www.qipamaijia.com";
const route = {
	path: "/:cate?",
	categories: ["picture"],
	example: "/qipamaijia/fuli",
	parameters: { cate: "频道名，可在对应网址中找到，默认为最新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["qipamaijia.com/", "qipamaijia.com/:cate"],
		target: "/:cate"
	}],
	name: "频道",
	maintainers: ["Fatpandac", "nczitzk"],
	handler,
	url: "qipamaijia.com/"
};
async function handler(ctx) {
	const cate = ctx.req.param("cate") ?? "";
	const url = `${rootUrl}/${cate}`;
	const $ = load((await got_default(url)).data);
	const title = $("#highlight").text();
	const items = $("div.col_l > div.block").toArray().map((item) => ({
		title: $(item).find("div.content").text(),
		link: $(item).find("a").attr("href"),
		description: $(item).find("div.content").html() + $(item).find("div.thumb").html()
	}));
	return {
		title: `奇葩买家秀 - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
