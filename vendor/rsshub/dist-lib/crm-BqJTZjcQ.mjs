import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fxiaoke/crm.ts
const baseUrl = "https://www.fxiaoke.com/crm";
const baseTitle = "纷享销客 CRM";
const titleMap = /* @__PURE__ */ new Map([
	["news", `全部文章 - ${baseTitle}`],
	["blog", `文章干货 - ${baseTitle}`],
	["articles", `CRM 知识 - ${baseTitle}`],
	["about-influence", `纷享动态 - ${baseTitle}`],
	["customers", `签约喜报 - ${baseTitle}`]
]);
const route = {
	path: "/crm/:type",
	categories: ["blog"],
	example: "/fxiaoke/crm/news",
	parameters: { type: "文章类型, 见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	maintainers: ["akynazh"],
	handler,
	description: `| 全部文章 | 文章干货 | CRM 知识 | 纷享动态        | 签约喜报  |
| -------- | -------- | -------- | --------------- | --------- |
| news     | blog     | articles | about-influence | customers |`
};
async function handler(ctx) {
	const t = ctx.req.param("type");
	const title = titleMap.get(t);
	const url = `${baseUrl}/${t}/`;
	const $ = load((await got_default(url)).data);
	const desc = $(".meeting").text().trim();
	let items = $(".content-item").toArray().map((item) => {
		item = $(item);
		const c1 = item.find(".baike-content-t1");
		const c3 = item.find(".baike-content-t3").find("span");
		return {
			title: c1.text().trim(),
			link: item.find("a").attr("href"),
			author: c3.last().text().trim()
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		const firstViewBox = $(".body-wrapper-article").first();
		firstViewBox.find("img").each((_, img) => {
			img = $(img);
			if (img.attr("zoomfile")) {
				img.attr("src", img.attr("zoomfile"));
				img.removeAttr("zoomfile");
				img.removeAttr("file");
			}
			img.removeAttr("onmouseover");
		});
		item.description = firstViewBox.html();
		item.pubDate = parseDate($(".month-day").first().text().trim());
		return item;
	})));
	return {
		title,
		link: url,
		description: desc,
		item: items
	};
}
//#endregion
export { route };
