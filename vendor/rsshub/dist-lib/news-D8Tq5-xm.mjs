import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as renderDescription } from "./description-BpSJoPdv.mjs";
import { load } from "cheerio";
//#region lib/routes/coolidge/news.ts
const handler = async () => {
	const link = "https://coolidge.org/about-us/news-media";
	const $ = load(await rofetch(link));
	return {
		title: "Coolidge Corner Theatre - News",
		link,
		description: "News",
		item: $("#block-coolidge-content > div > div > div.view-content").first().find("div.news-item").toArray().map((el) => {
			const element = $(el);
			const titleEl = element.find("h2.news-item__title > a").first();
			const title = titleEl.text().trim();
			const href = titleEl.attr("href");
			const descriptionText = element.find("div.news-item__content > p").first().text().trim();
			const imageSrc = element.find("div.news-item__image img").first().attr("src");
			const absoluteLink = href ? new URL(href, link).href : void 0;
			const absoluteImage = imageSrc ? new URL(imageSrc, link).href : void 0;
			return {
				title,
				description: renderDescription({
					image: absoluteImage,
					intro: descriptionText
				}),
				link: absoluteLink ?? link,
				guid: absoluteLink ?? absoluteImage ?? title
			};
		})
	};
};
const route = {
	path: "/news",
	name: "News",
	url: "coolidge.org/about-us/news-media",
	maintainers: ["johan456789"],
	example: "/coolidge/news",
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
