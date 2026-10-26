import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/bjfu/it/utils.ts
async function loadContent(link) {
	let response;
	try {
		response = await got_default.get(link, { responseType: "buffer" });
	} catch {
		return { description: "" };
	}
	const data = response.data;
	let $ = load(iconv.decode(data, "utf-8"));
	const charset = $("meta[charset]").attr("charset");
	if (charset?.toLowerCase() !== "utf-8") $ = load(iconv.decode(data, charset ?? "utf-8"));
	return { description: ($(".template-body").length ? $(".template-body").html() : "") + ($(".template-tail").length ? $(".template-tail").html() : "") };
}
const ProcessFeed = (base, list, caches) => Promise.all(list.map((item) => {
	const $ = load(item);
	const $title = $("a");
	const itemUrl = new URL($title.attr("href"), base).href;
	const pubDate = timezone(parseDate($("span").text().match(/\d{4}-\d{2}-\d{2}/)), 8);
	return caches.tryGet(itemUrl, async () => {
		const { description } = await loadContent(itemUrl);
		return {
			title: $title.text(),
			link: itemUrl,
			author: "北林信息",
			description,
			pubDate
		};
	});
}));
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/bjfu/it/index.ts
const route = {
	path: "/it/:type",
	categories: ["university"],
	example: "/bjfu/it/xyxw",
	parameters: { type: "通知类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["it.bjfu.edu.cn/:type/index.html"] }],
	name: "信息学院通知",
	maintainers: ["wzc-blog"],
	handler,
	description: `| 学院新闻 | 科研动态 | 本科生培养 | 研究生培养 |
| -------- | -------- | ---------- | ---------- |
| xyxw     | kydt     | pydt       | pydt2      |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	let title, path;
	switch (type) {
		case "kydt":
			title = "科研动态";
			path = "kyxz/kydt/";
			break;
		case "pydt":
			title = "本科生培养";
			path = "bkspy/pydt/";
			break;
		case "pydt2":
			title = "研究生培养";
			path = "yjspy/pydt2/";
			break;
		default:
			title = "学院新闻";
			path = "xyxw/";
	}
	const base = "http://it.bjfu.edu.cn/" + path;
	const data = (await got_default({
		method: "get",
		responseType: "buffer",
		url: base
	})).data;
	let $ = load(iconv.decode(data, "utf-8"));
	const charset = $("meta[charset]").attr("charset");
	if (charset?.toLowerCase() !== "utf-8") $ = load(iconv.decode(data, charset ?? "utf-8"));
	const list = $(".item-content").toArray();
	const result = await utils_default.ProcessFeed(base, list, cache_default);
	return {
		title: "北林信息 - " + title,
		link: "http://it.bjfu.edu.cn/" + path,
		description: "北京林业大学信息学院 - " + title,
		item: result
	};
}
//#endregion
export { route };
