import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as SUB_URL, r as loadArticle, t as SUB_NAME_PREFIX } from "./const-BxzXSacB.mjs";
import { load } from "cheerio";
//#region lib/routes/cosplaytele/popular.ts
const route = {
	path: "/popular/:period",
	categories: ["picture"],
	example: "/cosplaytele/popular/3",
	parameters: { period: "Days" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["cosplaytele.com/:period"],
		target: "/popular/:period"
	}],
	name: "Popular",
	maintainers: ["AiraNadih"],
	handler,
	url: "cosplaytele.com/"
};
function getPeriodConfig(period) {
	if (period === "1") return {
		url: `${SUB_URL}24-hours/`,
		range: "daily",
		title: `${SUB_NAME_PREFIX} - Top views in 24 hours`
	};
	return {
		url: `${SUB_URL}${period}-day/`,
		range: `last${period}days`,
		title: `${SUB_NAME_PREFIX} - Top views in ${period} days`
	};
}
async function handler(ctx) {
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const { url, range, title } = getPeriodConfig(ctx.req.param("period"));
	const { data } = await got_default.post(`${SUB_URL}wp-json/wordpress-popular-posts/v2/widget`, { json: {
		limit,
		range,
		order_by: "views"
	} });
	const $ = load(data.widget);
	const links = $(".wpp-list li").toArray().map((post) => $(post).find(".wpp-post-title").attr("href")).filter((link) => link !== void 0);
	return {
		title,
		link: url,
		item: await Promise.all(links.map((link) => cache_default.tryGet(link, () => loadArticle(link))))
	};
}
//#endregion
export { route };
