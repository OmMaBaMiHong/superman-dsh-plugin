import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/huizhou/zwgk/index.ts
const rootURL = "http://www.huizhou.gov.cn";
const route = {
	path: "/zwgk/:category?",
	categories: ["government"],
	example: "/gov/huizhou/zwgk/jgdt",
	parameters: { category: "资讯类别，可以从网址中得到，默认为政务要闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			title: "政务公开 - 政务要闻",
			source: ["www.huizhou.gov.cn/zwgk/hzsz/zwyw"],
			target: "/zwgk/zwyw"
		},
		{
			title: "政务公开 - 机关动态",
			source: ["www.huizhou.gov.cn/zwgk/hzsz/jgdt"],
			target: "/zwgk/jgdt"
		},
		{
			title: "政务公开 - 县区要闻",
			source: ["www.huizhou.gov.cn/zwgk/hzsz/xqyw"],
			target: "/zwgk/xqyw"
		}
	],
	name: "政务公开",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const cate = ctx.req.param("category") ?? "zwyw";
	const url = `${rootURL}/zwgk/hzsz/${cate}`;
	const $ = load((await got_default(url)).data);
	const title = $("span#navigation").children("a").last().text();
	const list = $("ul.ul_art_row").toArray().map((item) => ({
		title: $(item).find("a").text().trim(),
		link: $(item).find("a").attr("href"),
		pubDate: timezone(parseDate($(item).find("li.li_art_date").text().trim()), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		try {
			item.description = content("div.artContent").html();
			item.author = content("div.info_fbt").find("span.ly").text().match(/来源：(.*)/)[1];
			item.pubDate = timezone(parseDate(content("div.info_fbt").find("span.time").text().match(/时间：(.*)/)[1]), 8);
		} catch {
			item.description = "";
		}
		return item;
	})));
	return {
		title: `惠州市人民政府 - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
