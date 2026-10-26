import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/30secondsofcode/utils.ts
const rootUrl = "https://www.30secondsofcode.org";
async function processList(listElements) {
	return (await Promise.allSettled(listElements.map((item) => {
		const $ = load(item);
		return processItem({
			link: $(" article > h3 > a").attr("href"),
			date: $(" article > small > time").attr("datetime")
		});
	}))).map((item) => item.status === "fulfilled" ? item.value : { title: "Error Reading Item" });
}
async function processItem({ link: articleLink, date }) {
	return await cache_default.tryGet(`30secondsofcode:${articleLink}`, async () => {
		const finalLink = `${rootUrl}${articleLink}`;
		const $ = load(await rofetch(finalLink));
		const tags = $.root().find("body > main > nav > ol > li:not(:first-child):not(:last-child)").toArray().map((tag) => $(tag).find("a").text());
		const article = $("main > article");
		const title = article.find("h1").text();
		article.find("img").each((_, element) => {
			const img = $(element);
			const src = img.attr("src");
			if (src?.startsWith("/")) img.attr("src", `${rootUrl}${src}`);
		});
		const image = article.find("img").attr("src");
		const description = article.clone().find("h1, script").remove().end().html();
		return {
			title,
			link: finalLink,
			pubDate: parseDate(date),
			description,
			author: "30 Seconds of Code",
			category: tags,
			image: `${rootUrl}${image}`,
			banner: `${rootUrl}${image}`
		};
	});
}
//#endregion
export { rootUrl as n, processList as t };
