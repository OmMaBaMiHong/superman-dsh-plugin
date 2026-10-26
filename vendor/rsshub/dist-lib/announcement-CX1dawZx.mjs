import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cffex/announcement.ts
const route = {
	path: "/announcement",
	name: "交易所公告",
	url: "www.cffex.com.cn",
	maintainers: ["ChenXiangcheng1"],
	example: "/cffex/announcement",
	parameters: {},
	description: "",
	categories: ["government"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cffex.com.cn"],
		target: "/announcement"
	}],
	handler
};
async function handler() {
	const baseUrl = "http://www.cffex.com.cn";
	const homeUrl = `${baseUrl}/jystz`;
	const $ = load(await rofetch(homeUrl));
	const list = $("div.notice_list li").toArray().map((item) => {
		item = $(item);
		const titleEle = $(item).find("a").first();
		const dateEle = $(item).find("a").eq(1);
		return {
			title: titleEle.text().trim(),
			link: `${baseUrl}${titleEle.attr("href")}`,
			pubDate: timezone(parseDate(dateEle.text(), "YYYY-MM-DD"), 8)
		};
	});
	return {
		title: "中国金融期货交易所 - 交易所公告",
		link: homeUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))("div.jysggnr div.nan p").eq(1)?.html();
			return item;
		})))
	};
}
//#endregion
export { route };
