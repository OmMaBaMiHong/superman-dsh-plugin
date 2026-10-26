import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as getItem, t as baseUrl } from "./utils-Bje0iQgJ.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/qstheory/index.ts
const config = {
	toutiao: {
		title: "头条",
		url: `${baseUrl}/v9zhuanqu/toutiao/index.htm`
	},
	qswp: {
		title: "网评",
		url: `${baseUrl}/qswp.htm`
	},
	qssp: {
		title: "视频",
		url: `${baseUrl}/qssp/index.htm`
	},
	qslgxd: {
		title: "原创",
		url: `${baseUrl}/qslgxd/index.htm`
	},
	economy: {
		title: "经济",
		url: `${baseUrl}/economy/index.htm`
	},
	politics: {
		title: "政治",
		url: `${baseUrl}/politics/index.htm`
	},
	culture: {
		title: "文化",
		url: `${baseUrl}/culture/index.htm`
	},
	society: {
		title: "社会",
		url: `${baseUrl}/society/index.htm`
	},
	cpc: {
		title: "党建",
		url: `${baseUrl}/cpc/index.htm`
	},
	science: {
		title: "科教",
		url: `${baseUrl}/science/index.htm`
	},
	zoology: {
		title: "生态",
		url: `${baseUrl}/zoology/index.htm`
	},
	defense: {
		title: "国防",
		url: `${baseUrl}/defense/index.htm`
	},
	international: {
		title: "国际",
		url: `${baseUrl}/international/index.htm`
	},
	books: {
		title: "图书",
		url: `${baseUrl}/books/index.htm`
	},
	xxbj: {
		title: "学习笔记",
		url: `${baseUrl}/qszq/xxbj/index.htm`
	},
	llwx: {
		title: "理论文选",
		url: `${baseUrl}/qszq/llwx/index.htm`
	}
};
const route = {
	path: "/:category?",
	categories: ["traditional-media"],
	example: "/qstheory",
	parameters: { industry: "分类，见下表" },
	radar: [{ source: [
		"www.qstheory.cn/v9zhuanqu/:category/index.htm",
		"www.qstheory.cn/qszq/:category/index.htm",
		"www.qstheory.cn/:category/index.htm"
	] }],
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 头条    | 网评 | 视频 | 原创   | 经济    | 政治     | 文化    | 社会    | 党建 | 科教    | 生态    | 国防    | 国际          | 图书  | 学习笔记 | 理论文选 |
| ------- | ---- | ---- | ------ | ------- | -------- | ------- | ------- | ---- | ------- | ------- | ------- | ------------- | ----- | -------- | -------- |
| toutiao | qswp | qssp | qslgxd | economy | politics | culture | society | cpc  | science | zoology | defense | international | books | xxbj     | llwx     |`
};
async function handler(ctx) {
	const { category = "toutiao" } = ctx.req.param();
	const limit = Number.parseInt(ctx.req.query("limit")) || 50;
	const currentUrl = config[category].url;
	const response = await rofetch(currentUrl);
	const $ = cheerio.load(response);
	const list = $(".list-style1 ul li a, .text h2 a, .no-pic ul li a").slice(0, limit).toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.text(),
			link: $item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => getItem(item))));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
