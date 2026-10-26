import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/newyorker/news.ts
const host = "https://www.newyorker.com";
const route = {
	path: "/:category",
	categories: ["traditional-media"],
	view: 0,
	example: "/newyorker/latest",
	parameters: { category: "tab name. can be found at url" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["newyorker.com/:category?"] }],
	name: "Articles",
	maintainers: ["EthanWng97", "pseudoyu"],
	handler
};
async function handler(ctx) {
	const { category } = ctx.req.param();
	const $ = load(await rofetch(`${host}/${category}`));
	const list = JSON.parse($("script:contains(\"window.__PRELOADED_STATE__\")").text().match(/window\.__PRELOADED_STATE__ = (.*);/)?.[1] ?? "{}").transformed.bundle.containers[0].items;
	const items = await Promise.all(list.map((item) => {
		const url = `${host}${item.url}`;
		return cache_default.tryGet(url, async () => {
			const description = load(await rofetch(url))("#main-content");
			description.find("h1").remove();
			description.find(".article-body__footer").remove();
			description.find(".social-icons").remove();
			description.find("div[class^=\"ActionBarWrapperContent-\"]").remove();
			description.find("div[class^=\"ContentHeaderByline-\"]").remove();
			return {
				title: item.dangerousHed,
				pubDate: item.pubDate,
				link: url,
				description: description.html()
			};
		});
	}));
	return {
		title: `The New Yorker - ${category}`,
		link: host,
		description: "Reporting, Profiles, breaking news, cultural coverage, podcasts, videos, and cartoons from The New Yorker.",
		item: items
	};
}
//#endregion
export { route };
