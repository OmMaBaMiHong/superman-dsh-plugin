import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/panewslab/profundity.ts
const categories = {
	精选: "",
	链游: "aipysd",
	元宇宙: "arxgdo",
	NFT: "dwhfpp",
	DeFi: "gsqjtg",
	监管: "kohnph",
	央行数字货币: "loskks",
	波卡: "sxrabd",
	"Layer 2": "tdkreq",
	DAO: "yyufxg",
	融资: "zahilv",
	活动: "zqives"
};
const route = {
	path: "/profundity/:category?",
	categories: ["new-media"],
	example: "/panewslab/profundity",
	parameters: { category: "分类，见下表，默认为精选" },
	radar: [{ source: ["panewslab.com/"] }, { source: ["www.panewslab.com/zh/profundity/index.html"] }],
	name: "深度",
	maintainers: ["nczitzk"],
	handler,
	url: "panewslab.com/",
	description: `| 精选 | 链游 | 元宇宙 | NFT | DeFi | 监管 | 央行数字货币 | 波卡 | Layer 2 | DAO | 融资 | 活动 |
| ---- | ---- | ------ | --- | ---- | ---- | ------------ | ---- | ------- | --- | ---- | ---- |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "精选";
	const rootUrl = "https://panewslab.com";
	const apiUrl = `${rootUrl}/webapi/depth/list?LId=1&Rn=${ctx.req.query("limit") ?? 25}&TagId=${categories[category]}&tw=0`;
	const currentUrl = `${rootUrl}/zh/profundity/index.html`;
	let items = (await got_default({
		method: "get",
		url: apiUrl
	})).data.data.map((item) => ({
		title: item.title,
		author: item.author.name,
		pubDate: parseDate(item.publishTime * 1e3),
		link: `${rootUrl}/zh/articledetails/${item.id}.html`,
		description: `<blockquote>${item.desc}</blockquote>`,
		category: item.tags
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description += content("#txtinfo").html();
		return item;
	})));
	return {
		title: `PANews - ${category}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
