import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as parseReviews, n as fixImages, r as headers, t as baseUrl } from "./utils-2RKFMKAP.mjs";
import { load } from "cheerio";
//#region lib/routes/techpowerup/index.ts
const route = {
	path: "/",
	radar: [{ source: ["techpowerup.com/"] }],
	name: "Latest Content",
	maintainers: ["TonyRL"],
	example: "/techpowerup",
	handler,
	url: "www.techpowerup.com/"
};
async function handler() {
	const $ = load(await rofetch(baseUrl, { headers }));
	const list = $(".newspost").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find("h1 a");
		const date = $item.find("time").attr("datetime");
		return {
			title: a.text(),
			link: baseUrl + a.attr("href"),
			pubDate: date ? parseDate(date) : null,
			author: $item.find(".byline address").text(),
			category: $item.find(".byline .flags span").toArray().map((item) => $(item).text().trim())
		};
	});
	return {
		title: "TechPowerUp",
		link: baseUrl,
		language: "en",
		image: "https://tpucdn.com/apple-touch-icon-v1684568903519.png",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link, { headers }));
			fixImages($);
			if (item.link.includes("/review/")) {
				await parseReviews($, item);
				return item;
			}
			item.description = $(".newspost .text").html();
			item.category = [.../* @__PURE__ */ new Set([...item.category, ...$(".tags li a").toArray().map((item) => $(item).text())])];
			return item;
		})))
	};
}
//#endregion
export { route };
