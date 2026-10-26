import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as renderDescription } from "./description-B2ASvFKu.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/cmse/fxrw.ts
const route = {
	path: "/fxrw",
	categories: ["government"],
	example: "/gov/cmse/fxrw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.cmse.gov.cn/fxrw"] }],
	name: "飞行任务",
	maintainers: ["nczitzk"],
	handler,
	url: "www.cmse.gov.cn/fxrw"
};
async function handler() {
	const currentUrl = `http://www.cmse.gov.cn/fxrw/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $("#list li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".title").text().split("：").pop().trim(),
			link: new URL(item.attr("href"), currentUrl).href,
			pubDate: timezone(parseDate(item.find(".infoR").first().text().trim(), "YYYY年M月D日H时m分"), 8),
			description: renderDescription({
				image: new URL(item.find("img").attr("src"), currentUrl).href,
				description: item.find(".info").html()
			})
		};
	});
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
