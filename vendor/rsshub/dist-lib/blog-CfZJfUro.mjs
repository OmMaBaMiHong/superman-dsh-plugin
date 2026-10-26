import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cline/blog.ts
const rootUrl = "https://cline.bot";
const blogUrl = `${rootUrl}/blog`;
function extractArticlesFromDOM($) {
	return $("article.group").toArray().map((article) => {
		const element = $(article);
		const title = element.find("h2").text().trim();
		const link = element.find("a").first().attr("href");
		const fullLink = link ? link.startsWith("http") ? link : `${rootUrl}${link.startsWith("/") ? link : `/${link}`}` : "";
		const metaMatch = element.find(".text-sm.text-slate-500").text().trim().match(/^([^•]+)•\s*([A-Z]+\s+\d{1,2},?\s+\d{4})/i);
		const author = metaMatch ? metaMatch[1].trim() : "Cline Team";
		const pubDate = metaMatch ? parseDate(metaMatch[2]) : void 0;
		const summary = element.find("p.text-slate-600").text().trim();
		const imgSrc = element.find("img").attr("src") || "";
		return title && link ? {
			title,
			link: fullLink,
			pubDate,
			author,
			description: imgSrc ? `<img src="${imgSrc}" alt="${title}" /><p>${summary}</p>` : `<p>${summary}</p>`
		} : null;
	}).filter(Boolean);
}
async function handler() {
	const articles = extractArticlesFromDOM(load((await got_default({
		method: "get",
		url: `${rootUrl}/blog/archive`
	})).data));
	if (articles.length === 0) throw new Error("No articles found.");
	return {
		title: "Cline Official Blog",
		link: blogUrl,
		item: articles,
		description: "Cline Official Blog - AI Coding Assistant",
		language: "en"
	};
}
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/cline/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cline.bot/blog/archive", "cline.bot/blog"],
		target: "/blog"
	}],
	name: "Blog",
	maintainers: ["yeshan333"],
	description: "Cline Official Blog articles",
	handler,
	url: "cline.bot/blog"
};
//#endregion
export { route };
