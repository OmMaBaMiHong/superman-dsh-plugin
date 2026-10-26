import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cas/cg/index.ts
const route = {
	path: "/cg/:caty?",
	categories: ["university"],
	example: "/cas/cg/cgzhld",
	parameters: { caty: "分类，见下表，默认为工作动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.cas.cn/cg/:caty?"] }],
	name: "成果转化",
	maintainers: ["nczitzk"],
	handler,
	description: `| 工作动态 | 科技成果转移转化亮点工作 |
| -------- | ------------------------ |
| zh       | cgzhld                   |`
};
async function handler(ctx) {
	const caty = ctx.req.param("caty") || "zh";
	const rootUrl = "https://www.cas.cn";
	const currentUrl = `${rootUrl}/cg/${caty}/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("#content li").not(".gl_line").slice(0, 15).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: `${rootUrl}/cg/${caty}${a.attr("href").replace(".", "")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".TRS_Editor").html();
		item.pubDate = timezone(parseDate(content("meta[name=\"PubDate\"]").attr("content")), 8);
		return item;
	})));
	return {
		title: $("title").text().replace("----", " - "),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
