import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { i as parseReviews, n as fixImages, r as headers, t as baseUrl } from "./utils-2RKFMKAP.mjs";
import { load } from "cheerio";
//#region lib/routes/techpowerup/review.ts
const route = {
	path: "/review/:keyword?",
	categories: ["new-media"],
	example: "/techpowerup/review/amd",
	parameters: { keyword: "Search Keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["techpowerup.com/review/search", "techpowerup.com/review"],
		target: ""
	}],
	name: "Reviews",
	maintainers: ["TonyRL"],
	handler,
	url: "www.techpowerup.com/review/"
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const url = new URL(`${baseUrl}/review/${keyword ? "search/" : ""}`);
	if (keyword) {
		url.searchParams.set("q", keyword);
		url.searchParams.set("_", Date.now().toString());
	}
	const $ = load(await rofetch(url.href, { headers }));
	const list = $(".reviewlist-bit").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find(".title a");
		return {
			title: a.text(),
			link: baseUrl + a.attr("href"),
			pubDate: parseDate($item.find(".date time").attr("datetime")),
			author: $item.find(".author").contents().filter((_, c) => c.type === "text").text().trim(),
			category: $item.find(".category").contents().filter((_, c) => c.type === "text").text().trim()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link, { headers }));
		fixImages($);
		await parseReviews($, item);
		return item;
	})));
	return {
		title: "Reviews | TechPowerUp",
		link: url.href,
		language: "en",
		image: "https://tpucdn.com/apple-touch-icon-v1684568903519.png",
		item: items
	};
}
//#endregion
export { route };
