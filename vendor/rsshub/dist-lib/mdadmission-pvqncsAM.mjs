import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/pumc/mdadmission.ts
const route = {
	path: "/mdadmission",
	categories: ["university"],
	example: "/pumc/mdadmission",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mdadmission.pumc.edu.cn/mdweb/site", "mdadmission.pumc.edu.cn/"] }],
	name: "“4+4” 试点班招生网通知公告",
	maintainers: ["nczitzk"],
	handler,
	url: "mdadmission.pumc.edu.cn/mdweb/site"
};
async function handler(ctx) {
	const currentUrl = `https://mdadmission.pumc.edu.cn/mdweb/site!noticeList?param.infoTypeId=&rows=${ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100}&pages=1`;
	const $ = load((await got_default(currentUrl)).data);
	let items = $("div.media").toArray().map((item) => {
		item = $(item);
		const a = item.find("h4.media-heading a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), currentUrl).href,
			pubDate: parseDate(item.find("span").first().text(), "DDYYYY-MM")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content("h3").remove();
		item.description = content("div.media-body div").last().html();
		return item;
	})));
	return {
		title: "北京协和医学院招生网 - 通知公告",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
