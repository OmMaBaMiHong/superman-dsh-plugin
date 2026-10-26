import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/researchgate/publications.ts
const route = {
	path: "/publications/:id",
	radar: [{
		source: ["researchgate.net/profile/:username"],
		target: "/publications/:username"
	}],
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const currentUrl = `https://www.researchgate.net/profile/${ctx.req.param("id")}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		const request = route.request();
		request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
	});
	await page.goto(currentUrl);
	const response = await page.evaluate(() => document.documentElement.innerHTML);
	await page.close();
	const $ = load(response);
	const list = $("div[itemprop=\"headline\"] a").toArray().slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 15).map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const request = route.request();
			request.resourceType() === "document" || request.resourceType() === "script" ? route.continue() : route.abort();
		});
		await page.goto(item.link);
		const detailResponse = await page.evaluate(() => document.documentElement.innerHTML);
		await page.close();
		const content = load(detailResponse);
		item.doi = content("meta[property=\"citation_doi\"]").attr("content");
		item.pubDate = parseDate(content("meta[property=\"citation_publication_date\"]").attr("content"));
		const authors = [];
		content("meta[property=\"citation_author\"]").each((_, el) => {
			authors.push(content(el).attr("content"));
		});
		item.author = authors.join(", ");
		item.description = content("div[itemprop=\"description\"]").html();
		return item;
	})));
	await context.close();
	return {
		title: `${$("meta[property=\"profile:username\"]").attr("content")}'s Publications - ResearchGate`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
