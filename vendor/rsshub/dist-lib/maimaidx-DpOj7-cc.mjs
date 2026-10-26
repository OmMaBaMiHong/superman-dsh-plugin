import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/sega/maimaidx.ts
const route = {
	path: "/maimaidx/news",
	categories: ["game"],
	example: "/sega/maimaidx/news",
	radar: [{ source: ["info-maimai.sega.jp/"] }],
	name: "maimai DX Japanese Ver. News",
	maintainers: ["randompasser"],
	handler,
	url: "info-maimai.sega.jp/"
};
async function handler() {
	const baseUrl = "https://info-maimai.sega.jp/";
	const parseContent = (htmlString, image) => {
		const content = cheerio.load(htmlString)(".maiMd");
		content.prepend(image);
		content.find(".hrLine").replaceWith("<hr/>");
		return content.html();
	};
	const response = await got_default(baseUrl);
	const $ = cheerio.load(response.data);
	const list = $(".maiPager-content .newsBox");
	return {
		title: "maimai DX - Japanese Ver. News",
		link: baseUrl,
		language: "ja",
		item: await Promise.all(list.map(async (_, items) => {
			const i = $(items);
			const title = i.find(".newsLink").text();
			const pubDate = parseDate(i.find(".newsDate").text().slice(0, 10), "YYYY.MM.DD");
			const image = i.find(".newsImg");
			const link = i.find("a").attr("href");
			return await cache_default.tryGet(link, async () => {
				const response = await got_default(link);
				const description = parseContent(response.body, image);
				return {
					title,
					link,
					description,
					pubDate
				};
			});
		}))
	};
}
//#endregion
export { route };
