import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/iqiyi/video.ts
const route = {
	path: "/user/video/:uid",
	categories: ["multimedia"],
	example: "/iqiyi/user/video/2289191062",
	parameters: { uid: "用户名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["iqiyi.com/u/:uid/*"] }],
	name: "用户视频",
	maintainers: ["talengu", "JimenezLi"],
	handler
};
async function handler(ctx) {
	const link = `https://www.iqiyi.com/u/${ctx.req.param("uid")}/videos`;
	const context = await outPlaywright();
	const data = await cache_default.tryGet(link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		logger.http(`Requesting ${link}`);
		await page.goto(link, { waitUntil: "domcontentloaded" });
		await page.waitForSelector("li.pic-txt-li");
		const $ = load(await page.content());
		const list = $("li.pic-txt-li");
		return {
			title: $("title").text(),
			link,
			item: list.toArray().map((item) => ({
				title: $(item).attr("title"),
				pubDate: parseDate($(item).find(".li-sub span.sub-date").text(), "YYYY-MM-DD"),
				link: $(item).find(".li-dec a").attr("href")
			}))
		};
	}, config.cache.routeExpire, false);
	await context.close();
	return data;
}
//#endregion
export { route };
