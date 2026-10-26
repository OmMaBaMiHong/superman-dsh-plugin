import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/miit/wjgs.ts
const baseUrl = "https://www.miit.gov.cn";
const siteUrl = `${baseUrl}/zwgk/wjgs/index.html`;
const route = {
	path: "/wjgs",
	categories: ["government"],
	example: "/gov/miit/wjgs",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文件公示",
	maintainers: ["Yoge-Code"],
	handler
};
async function handler() {
	const $ = load((await got_default(siteUrl)).data);
	const buildStatic = $("script[parseType=buildstatic]");
	const requestUrl = buildStatic.attr("url");
	const queryData = JSON.parse(buildStatic.attr("querydata").replaceAll("'", "\""));
	const { data } = await got_default(`${baseUrl}${requestUrl}`, {
		headers: { referer: siteUrl },
		searchParams: queryData
	});
	const list = load(data.data.html, null, false);
	let items = list(".page-content ul li").toArray().map((item) => {
		item = list(item);
		return {
			title: item.find("a").attr("title"),
			link: new URL(item.find("a").attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".fr").text(), "YYYY-MM-DD")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		const $ = load(data);
		$("iframe").each((_, e) => {
			e = $(e);
			if (e.attr("src").startsWith("/")) e.attr("src", new URL(e.attr("src"), baseUrl).href);
		});
		item.author = $(".cinfo").text().match(/来源：(.*)/)[1];
		item.pubDate = timezone(parseDate($("#con_time").text(), "YYYY-MM-DD HH:mm"), 8);
		item.description = $(".ccontent").html();
		return item;
	})));
	return {
		title: `${$("head title").text()} - ${$("meta[name=SiteName]").attr("content")}`,
		link: siteUrl,
		item: items
	};
}
//#endregion
export { route };
