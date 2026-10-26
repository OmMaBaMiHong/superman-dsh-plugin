import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import R from "node:zlib";
import { load } from "cheerio";
//#region lib/routes/wtu/job.ts
const baseUrl = "https://wtu.91wllm.com/";
const typeMap = /* @__PURE__ */ new Map([
	["xxtz", {
		title: "信息通知",
		url: `${baseUrl}news/index/tag/xxtz`
	}],
	["tzgg", {
		title: "通知公告",
		url: `${baseUrl}news/index/tag/tzgg`
	}],
	["xwkd", {
		title: "新闻快递",
		url: `${baseUrl}news/index/tag/xwkd`
	}]
]);
/**
* 解压缩数据
* @param {String} str
* @returns {String}
*/
function decodeData(str) {
	const match = str.match(/Base64.decode\(unzip\("(.+?)"\)\.substr\((\d+)\)\)\.substr\((\d+)\)/);
	if (!match) return "";
	const compressedContent = match[1];
	const substr1Num = Number.parseInt(match[2]);
	const substr2Num = Number.parseInt(match[3]);
	const unzipContent = R.inflateSync(Buffer.from(compressedContent, "base64")).toString("utf8");
	return Buffer.from(unzipContent.slice(substr1Num), "base64").toString("utf8").slice(substr2Num);
}
const route = {
	path: "/job/:type",
	categories: ["university"],
	example: "/wtu/job/xxtz",
	parameters: { type: "信息类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wtu.91wllm.com/news/index/tag/:type"] }],
	name: "就业信息",
	maintainers: ["ticks-tan"],
	handler,
	description: `| 信息类型 | 消息通知 | 通知公告 | 新闻快递 |
| -------- | -------- | -------- | -------- |
| 参数     | xxtz     | tzgg     | xwkd     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const mapItem = typeMap.get(type);
	const msgTitle = `${mapItem.title} - 武汉纺织大学就业信息`;
	const link = mapItem.url;
	const $ = load(decodeData((await got_default.get(link)).data));
	const list = $(".newsList").toArray().map((item) => {
		item = $(item);
		const $date = item.find("li[class='span2 y']").text();
		const $linkLi = item.find("li>a");
		const $url = new URL($linkLi.attr("href"), baseUrl).href;
		return {
			title: $linkLi.text(),
			pubDate: parseDate($date, "YYYY-MM-DD"),
			link: $url
		};
	});
	return {
		title: msgTitle,
		link,
		description: msgTitle,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default.get(item.link);
			item.description = decodeData(response);
			return item;
		})))
	};
}
//#endregion
export { route };
