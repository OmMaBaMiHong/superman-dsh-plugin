import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/colamanga/manga.ts
const domain = "www.colamanga.com";
const route = {
	path: "/:id",
	parameters: { id: "漫画id" },
	name: "Manga",
	maintainers: ["machsix"],
	example: "/colamanga/manga-qq978758",
	categories: ["anime"],
	radar: [{
		source: [`${domain}/:id/`],
		target: "/:id"
	}],
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler
};
function shift_date(date, days) {
	const result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}
async function handler(ctx) {
	const id = ctx.req.param("id");
	const url = `https://${domain}/${id}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	logger.http(`Requesting ${url}`);
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const response = await page.content();
	await context.close();
	const $ = load(response);
	const book_name = $("meta[property='og:comic:book_name']").attr("content");
	const updateDateAttr = $("meta[property='og:comic:update_time']").attr("content");
	const updateDate = updateDateAttr ? timezone(parseDate(updateDateAttr)) : timezone(/* @__PURE__ */ new Date());
	const author = $("span:contains('作者')").parent().contents().eq(1).text();
	const items = $(".all_data_list >ul>li>a").toArray().map((elem, i) => ({
		title: `${book_name} ${$(elem).text()}`,
		link: elem.attribs.href,
		description: $(".fed-part-esan").text(),
		author,
		pubDate: shift_date(updateDate, -7 * i)
	}));
	return {
		title: book_name || "Unknown Manga",
		link: url,
		item: items
	};
}
//#endregion
export { route };
