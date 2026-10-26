import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xaut/index.ts
const route = {
	path: "/index/:category?",
	categories: ["university"],
	example: "/xaut/index/tzgg",
	parameters: { category: "通知类别，默认为学校新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "学校主页",
	maintainers: ["mocusez"],
	handler,
	description: `| 学校新闻 | 砥志研思 | 立德树人 | 传道授业 | 校闻周知 |
| :------: | :------: | :------: | :------: | :------: |
|   xxxw   |   dzys   |   ldsr   |   cdsy   |   xwzz   |`
};
async function handler(ctx) {
	let category = ctx.req.param("category");
	const dic_html = {
		xxxw: "xxxw.htm",
		dzys: "dzys.htm",
		ldsr: "ldsr.htm",
		cdsy: "cdsy.htm",
		xwzz: "xwzz.htm"
	};
	const dic_title = {
		xxxw: "学校新闻",
		dzys: "砥志研思",
		ldsr: "立德树人",
		cdsy: "传道授业",
		xwzz: "校闻周知"
	};
	if (dic_title[category] === void 0) category = "xxxw";
	const data = (await got_default({
		method: "get",
		url: "http://www.xaut.edu.cn/index/" + dic_html[category]
	})).body;
	const $ = load(data);
	const list = $("div.nlist ul li").toArray().map((item) => {
		item = $(item);
		const link = item.find("a").attr("href").replace(/^\.\./, "http://www.xaut.edu.cn");
		const pubDate = timezone(parseDate(item.find("div.time").text().trim()), 8);
		return {
			title: item.find("h5").text(),
			link,
			pubDate
		};
	});
	return {
		title: "西安理工大学官网-" + dic_title[category],
		link: "http://www.xaut.edu.cn",
		description: "西安理工大学官网-" + dic_title[category],
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (!item.link.includes("://zhixing.xaut.edu.cn/") && !item.link.includes("://xinwen.xaut.edu.cn/")) item.description = load((await got_default({
				method: "get",
				url: item.link
			})).body)("#vsb_content").html();
			else item.description = "请在校内或校园VPN内查看内容";
			return item;
		})))
	};
}
//#endregion
export { route };
