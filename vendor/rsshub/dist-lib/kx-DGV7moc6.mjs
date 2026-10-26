import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/fx678/kx.ts
const route = {
	path: "/kx",
	categories: ["finance"],
	view: 5,
	example: "/fx678/kx",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["fx678.com/kx"] }],
	name: "7x24 小时快讯",
	maintainers: ["occupy5", "dousha"],
	handler,
	url: "fx678.com/kx"
};
async function handler() {
	const link = "https://www.fx678.com/kx/";
	const $ = load((await got_default.get(link)).data);
	const list = $(".body_zb ul .body_zb_li .zb_word").find(".list_font_pic > a:first-child").toArray().slice(0, 30).map((e) => $(e).attr("href"));
	return {
		title: "7x24小时快讯",
		link,
		item: await Promise.all(list.map((itemUrl) => cache_default.tryGet(itemUrl, async () => {
			const $ = load((await got_default.get(itemUrl)).data);
			const contentPart = $(".article-main .content").html().trim();
			const forewordPart = $(".article-main .foreword").html().trim();
			const articlePubDate = timezone(parseDate($(".article-cont .details i").text().trim(), "YYYY-MM-DD HH:mm:ss"), 8);
			return {
				title: $(".article-main .foreword").text().trim().split("——").pop(),
				link: itemUrl,
				description: contentPart.length > 1 ? contentPart : forewordPart,
				pubDate: articlePubDate
			};
		})))
	};
}
//#endregion
export { route };
