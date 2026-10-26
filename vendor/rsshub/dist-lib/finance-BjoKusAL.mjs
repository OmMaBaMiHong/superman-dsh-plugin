import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/china/finance/finance.ts
const CATEGORY_MAP = {
	tuijian: "tuijian",
	TMT: "TMT",
	jinrong: "jinrong",
	dichan: "dichan",
	xiaofei: "xiaofei",
	yiyao: "yiyao",
	wine: "wine",
	IPO: "IPO"
};
const route = {
	path: "/finance/:category?",
	categories: ["new-media"],
	example: "/china/finance",
	parameters: { category: "Category of news. See the form below for details, default is suggest news." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["finance.china.com/:category"] }],
	name: "Finance News 财经 - 财经新闻",
	maintainers: ["KingJem"],
	handler,
	description: `| 推荐    | TMT | 金融    | 地产   | 消费    | 医药  | 酒业 | IPO 观察 |
| ------- | --- | ------- | ------ | ------- | ----- | ---- | -------- |
| tuijian | TMT | jinrong | dichan | xiaofei | yiyao | wine | IPO      |

> Note: The default news num is \`30\`.

> 注意：默认新闻条数是 \`30\`。`
};
async function handler(ctx) {
	const websiteUrl = `https://finance.china.com/${CATEGORY_MAP[ctx.req.param("category")] ?? CATEGORY_MAP.tuijian}`;
	const data = (await got_default(websiteUrl)).data;
	const $ = load(data);
	const listCategory = `中华网-财经-${$(".list-hd strong").text()}新闻`;
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const detailsUrls = $(".item-con-inner").toArray().map((item) => {
		item = $(item);
		return { link: item.find(".tit>a").attr("href") };
	}).filter((item) => item.link !== void 0).slice(0, limit);
	const items = await Promise.all(detailsUrls.map((item) => cache_default.tryGet(item.link, async () => {
		const $d = load((await got_default(item.link)).data);
		return {
			title: $d(".article_title").text(),
			link: item.link,
			description: $d("#js_article_content").html(),
			pubDate: timezone(parseDate($d(".article_info>span.time").text()), 8),
			author: $d(" div.article_info > span.source").text(),
			category: listCategory
		};
	})));
	return {
		title: $("head title").text(),
		link: websiteUrl,
		category: listCategory,
		item: items
	};
}
//#endregion
export { route };
