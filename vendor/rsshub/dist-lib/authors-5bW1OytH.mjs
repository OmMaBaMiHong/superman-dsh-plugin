import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { t as parseArticle } from "./utils-DCnpvwsm.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/bloomberg/authors.ts
const parseAuthorNewsList = async (slug) => {
	const baseURL = `https://www.bloomberg.com/authors/${slug}`;
	const resp = await rofetch(`https://www.bloomberg.com/lineup/api/lazy_load_author_stories?slug=${slug}&authorType=default&page=1`);
	if (!resp.html) return [];
	const $ = load(resp.html);
	return $("article.story-list-story").toArray().map((item) => {
		item = $(item);
		const headline = item.find("a.story-list-story__info__headline-link");
		return {
			title: headline.text(),
			pubDate: item.attr("data-updated-at"),
			guid: `bloomberg:${item.attr("data-id")}`,
			link: new URL(headline.attr("href"), baseURL).href
		};
	});
};
const route = {
	path: "/authors/:id/:slug/:source?",
	categories: ["finance"],
	view: 0,
	example: "/bloomberg/authors/ARbTQlRLRjE/matthew-s-levine",
	parameters: {
		id: "Author ID, can be found in URL",
		slug: "Author Slug, can be found in URL",
		source: "Data source, either `api` or `rss`,`api` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.bloomberg.com/*/authors/:id/:slug", "www.bloomberg.com/authors/:id/:slug"],
		target: "/authors/:id/:slug"
	}],
	name: "Authors",
	maintainers: ["josh", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const { id, slug, source } = ctx.req.param();
	const link = `https://www.bloomberg.com/authors/${id}/${slug}`;
	let list = [];
	if (!source || source === "api") list = await parseAuthorNewsList(`${id}/${slug}`);
	if (source === "rss" || list.length === 0) list = (await parser.parseURL(`${link}.rss`)).items;
	const item = await pMap(list, (item) => parseArticle(item), { concurrency: 1 });
	return {
		title: `Bloomberg - ${item.find((i) => i.author)?.author ?? slug}`,
		link,
		language: "en-us",
		item
	};
}
//#endregion
export { route };
