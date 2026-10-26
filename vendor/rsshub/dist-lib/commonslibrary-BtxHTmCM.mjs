import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/parliament.uk/commonslibrary.ts
const route = {
	path: "/commonslibrary/type/:topic?",
	categories: ["government"],
	example: "/parliament.uk/commonslibrary/type/research-briefing",
	parameters: { topic: "research by topic, string, example: [research-briefing|data-dashboard]" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Commonlibrary",
	maintainers: ["AntiKnot"],
	handler
};
async function handler(ctx) {
	const { topic } = ctx.req.param();
	const url = `https://commonslibrary.parliament.uk/type/${topic}/`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const html = await page.evaluate(() => document.documentElement.innerHTML);
	await page.close();
	const $ = load(html);
	const items = $("div.l-box.l-box--no-border.card__text").toArray().map((article) => ({
		title: $(article).find(".card__text a").text().trim(),
		link: $(article).find(".card__text a").attr("href"),
		description: $(article).find("p").last().text().trim(),
		pubDate: timezone($(article).find(".card__date time").attr("datetime"))
	}));
	await context.close();
	return {
		title: `parliament - lordslibrary - ${topic}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
