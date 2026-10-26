import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/annualreviews/index.ts
const route = {
	path: "/:id",
	categories: ["journal"],
	example: "/annualreviews/anchem",
	parameters: { id: "Journal id, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: true
	},
	radar: [{ source: ["annualreviews.org/journal/:id", "annualreviews.org/"] }],
	name: "Journal",
	maintainers: ["nczitzk"],
	handler,
	description: `The URL of the journal [Annual Review of Analytical Chemistry](https://www.annualreviews.org/journal/anchem) is \`https://www.annualreviews.org/journal/anchem\`, where \`anchem\` is the id of the journal, so the route for this journal is \`/annualreviews/anchem\`.

::: tip
More jounals can be found in [Browse Journals](https://www.annualreviews.org/action/showPublications).
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const rootUrl = "https://www.annualreviews.org";
	const apiRootUrl = "https://api.crossref.org";
	const feedUrl = `${rootUrl}/r/${id}_rss`;
	const currentUrl = `${rootUrl}/toc/${id}/current`;
	const $ = load((await got_default({
		method: "get",
		url: feedUrl
	})).data);
	let items = $("entry").toArray().map((item) => {
		item = $(item);
		const doi = item.find("id").text().split("doi=").pop();
		return {
			doi,
			guid: doi,
			title: item.find("title").text(),
			link: item.find("link").attr("href").split("?", 1)[0],
			description: item.find("content").text(),
			pubDate: parseDate(item.find("published").text()),
			author: item.find("author name").toArray().map((a) => $(a).text()).join(", ")
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.guid, async () => {
		item.description = (await got_default({
			method: "get",
			url: `${apiRootUrl}/works/${item.doi}`
		})).data.message.abstract.replaceAll("jats:p>", "p>");
		return item;
	})));
	return {
		title: $("title").first().text().replace(/: Table of Contents/, ""),
		description: $("subtitle").first().text(),
		link: currentUrl,
		item: items,
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
