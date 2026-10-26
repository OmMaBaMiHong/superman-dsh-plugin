import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as renderDescription } from "./description-BpSJoPdv.mjs";
import { load } from "cheerio";
//#region lib/routes/coolidge/film-guide.ts
const handler = async () => {
	const link = "https://coolidge.org/film-guide";
	const container = load(await rofetch(link))("#block-coolidge-content > article > div.node__content > div").first();
	const cover = container.find("p").eq(0).find("img").first().attr("src");
	const title = container.find("p").eq(1).text().trim();
	const description = container.find("p").eq(2).text().trim();
	const itemLink = container.find("a").first().attr("href");
	const absoluteCover = cover ? new URL(cover, link).href : void 0;
	const absoluteItemLink = itemLink ? new URL(itemLink, link).href : void 0;
	return {
		title: "Coolidge Corner Theatre - Film Guide",
		link,
		description: "Film Guide",
		item: [{
			title,
			description: renderDescription({
				image: absoluteCover,
				intro: description
			}),
			link: absoluteItemLink ?? link,
			guid: absoluteItemLink ?? absoluteCover ?? link
		}]
	};
};
const route = {
	path: "/film-guide",
	name: "Film Guide",
	url: "coolidge.org/film-guide",
	maintainers: ["johan456789"],
	example: "/coolidge/film-guide",
	categories: ["blog"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	handler
};
//#endregion
export { route };
