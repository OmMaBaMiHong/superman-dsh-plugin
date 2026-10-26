import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { inflateSync } from "node:zlib";
import { load } from "cheerio";
//#region lib/routes/csu/utils.ts
const unzip = (b64Data) => {
	const charData = [...Buffer.from(b64Data, "base64").toString("binary")].map((x) => x.charCodeAt(0));
	const data = inflateSync(new Uint8Array(charData));
	let ret = "";
	for (const c of data) ret += String.fromCharCode(c);
	return ret;
};
//#endregion
//#region lib/routes/csu/career.ts
const route = {
	path: "/career",
	categories: ["university"],
	example: "/csu/career",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"career.csu.edu.cn/campus/index/category/1",
		"career.csu.edu.cn/campus",
		"career.csu.edu.cn/"
	] }],
	name: "就业信息网招聘信息",
	maintainers: ["TonyRL"],
	handler,
	url: "career.csu.edu.cn/campus/index/category/1"
};
async function handler() {
	const baseUrl = "https://career.csu.edu.cn";
	const link = `${baseUrl}/campus/index/category/1`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".infoList").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			link: `${baseUrl}${item.find("a").attr("href")}`,
			pubDate: timezone(parseDate(item.find(".span4").text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		let $ = load(response);
		const zipped = $("script[type=\"text/javascript\"]").text().match(/Base64\.decode\(unzip\("(.*)"\)\./)[1];
		const { slice1, slice2 } = $("script[type=\"text/javascript\"]").text().match(/"\)\.substr\((?<slice1>\d+)\)\)\.substr\((?<slice2>\d+)\)\);/).groups;
		$ = load(Buffer.from(unzip(zipped).slice(slice1), "base64").toString().slice(slice2), null, false);
		item.description = $.html();
		return item;
	})));
	return {
		title: `${$(".curr").text()} - ${$("head title").text()}`,
		link,
		item: items
	};
}
//#endregion
export { route };
