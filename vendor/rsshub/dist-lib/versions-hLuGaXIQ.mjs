import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/apkpure/versions.ts
const route = {
	path: "/versions/:pkg/:region?",
	categories: ["program-update"],
	example: "/apkpure/versions/jp.co.craftegg.band/jp",
	parameters: {
		pkg: "Package name",
		region: "Region code, `en` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Versions",
	maintainers: ["maple3142"],
	handler
};
async function handler(ctx) {
	const { pkg, region = "en" } = ctx.req.param();
	const baseUrl = "https://apkpure.com";
	const link = `${baseUrl}/${region}/${pkg}/versions`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	logger.http(`Requesting ${link}`);
	await page.goto(link, { waitUntil: "domcontentloaded" });
	const r = await page.evaluate(() => document.documentElement.innerHTML);
	await context.close();
	const $ = load(r);
	const img = new URL($(".ver-top img").attr("src"));
	img.searchParams.delete("w");
	const items = $(".ver li").toArray().map((ver) => {
		ver = $(ver);
		return {
			title: ver.find(".ver-item-n").text(),
			description: ver.html(),
			link: `${baseUrl}${ver.find("a").attr("href")}`,
			pubDate: parseDate(ver.find(".update-on").text().replaceAll(/年|月/g, "-").replace("日", ""))
		};
	});
	return {
		title: $(".ver-top-h1").text(),
		description: $(".ver-top-title p").text(),
		image: img.href,
		language: region ?? "en",
		link,
		item: items
	};
}
//#endregion
export { route };
