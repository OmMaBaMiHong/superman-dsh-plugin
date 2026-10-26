import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bioone/journal.ts
const route = {
	path: "/journals/:journal?",
	categories: ["journal"],
	example: "/bioone/journals/acta-chiropterologica",
	parameters: { journal: "Journals, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["bioone.org/journals/:journal", "bioone.org/"],
		target: "/journals/:journal"
	}],
	name: "Journals",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const journal = ctx.req.param("journal") ?? "acta-chiropterologica";
	const rootUrl = "https://bioone.org";
	const currentUrl = `${rootUrl}/journals/${journal}/current`;
	const $ = load((await got_default(currentUrl)).data);
	let items = $(".TOCLineItemBoldText").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20).toArray().map((item) => {
		item = $(item).parent();
		return { link: `${rootUrl}${item.attr("href")}` };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		content(".ProceedingsArticleOpenAccessPanel").remove();
		content("#divNotSignedSection, #rightRail").remove();
		item.description = content(".panel-body").html();
		item.title = content("meta[name=\"dc.Title\"]").attr("content");
		item.author = content("meta[name=\"dc.Creator\"]").attr("content");
		item.doi = content("meta[name=\"dc.Identifier\"]").attr("content");
		item.pubDate = parseDate(content("meta[name=\"dc.Date\"]").attr("content"));
		return item;
	})));
	return {
		title: `${$(".panel-body .row a").first().text()} - BioOne`,
		description: $(".panel-body .row text").first().text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
