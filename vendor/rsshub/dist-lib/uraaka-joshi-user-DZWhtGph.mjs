import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/uraaka-joshi/uraaka-joshi-user.ts
const route = {
	path: "/:id",
	categories: ["other"],
	example: "/uraaka-joshi/_rrwq",
	parameters: { id: "User ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{ source: ["uraaka-joshi.com/:id"] }],
	name: "User",
	maintainers: ["SettingDust", "Halcao"],
	handler,
	url: "uraaka-joshi.com/"
};
async function handler(ctx) {
	const link = `https://www.uraaka-joshi.com/user/${ctx.req.param("id")}`;
	const $ = load(await cache_default.tryGet(link, async () => {
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" || request.resourceType() === "fetch" ? route.continue() : route.abort();
		});
		page.on("requestfinished", async (request) => {
			if (request.url() !== link) return;
			if ((await request.response())?.status() === 403) await page.close();
		});
		let html;
		try {
			await page.goto(link, { waitUntil: "domcontentloaded" });
			await page.waitForSelector("#pickup03 .grid-cell");
			await page.waitForSelector("#pickup04 .grid-cell");
			await page.waitForSelector("#main-block .grid-cell");
			html = await page.evaluate(() => document.documentElement.innerHTML);
		} catch {
			throw new Error("Access denied (403)");
		}
		await context.close();
		return html;
	}, config.cache.routeExpire, false));
	const items = $("#main-block .grid .grid-cell").toArray().map((item) => {
		item = $(item);
		item.find("*").removeAttr("onclick");
		item.find("*").removeAttr("onerror");
		item.find("*").removeAttr("style");
		const account = item.find(".account-group-link-row");
		account.html(account.text());
		item.find(".plyr--video").each((_, player) => {
			player = $(player);
			const v = player.find("video");
			player.replaceWith(v);
			v.attr("poster", "https:" + v.attr("data-poster"));
			v.find("source").attr("src", "https:" + v.find("source").attr("src"));
		});
		item.find("img").each((_, i) => {
			i = $(i);
			i.attr("src", "https:" + i.attr("data-src").split("?resize", 1)[0]);
			i.removeAttr("data-src");
		});
		const author = item.find(".account-group").text();
		const categories = item.find(".hashtag-item .hashtag").toArray().map((c) => $(c).text().trim());
		const link = item.find(".account-group-link-row").attr("href");
		const date = parseDate(item.find(".profile-char").attr("datetime"));
		const guid = item.find("a.tap-image").attr("data-tweet-id") || item.find("video[class^=\"js-player-\"]").attr("data-tweet-id");
		item.find(".grow-room").remove();
		item.find("div.profile-group.mt10.prl2").eq(1).remove();
		return {
			title: item.find(".profile-text").text(),
			description: item.html(),
			link,
			pubDate: date,
			guid,
			category: categories,
			author
		};
	});
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link,
		item: items
	};
}
//#endregion
export { route };
