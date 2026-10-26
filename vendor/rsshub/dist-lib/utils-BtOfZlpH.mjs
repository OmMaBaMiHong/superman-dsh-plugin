import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/joshwcomeau/utils.ts
const rootUrl = "https://www.joshwcomeau.com";
async function getRelativeUrlList(url, selector) {
	const $ = load(await rofetch(url));
	return {
		heading: $("header>h1").text(),
		urls: $(selector).toArray().map((element) => {
			return {
				url: $(element).attr("href"),
				cardTitle: $(element).find("span").text()
			};
		})
	};
}
async function processList(list) {
	return (await Promise.allSettled(list.map(async (item) => await cache_default.tryGet(`joshwcomeau:${item.url}`, async () => await getPostContent(item))))).map((item, index) => item.status === "fulfilled" ? item.value : {
		title: "Error Reading Item",
		link: `${rootUrl}${list[index]?.url}`
	});
}
async function getPostContent({ url, cardTitle }) {
	if (url.startsWith("https")) return {
		title: cardTitle ?? "External Content",
		description: "Read it on external Site",
		link: url
	};
	const $ = load(await rofetch(`${rootUrl}${url}`));
	const title = $("meta[property=\"og:title\"]").attr("content")?.replace("• Josh W. Comeau", "");
	const summary = $("meta[property=\"og:description\"]").attr("content");
	const author = $("meta[name=\"author\"]").attr("content");
	const dateDiv = $("div[data-parent-layout]");
	const tag = dateDiv.find("dl:first-child > dd > a").text();
	const pubDate = dateDiv.find("dl:first-child > dd:has(span):not(:last-child)").text();
	const updateDate = dateDiv.find("dl:last-child > dd:has(span):not(:last-child)").text();
	const description = $("main > article").html();
	return {
		title,
		description,
		author,
		pubDate: processDate(pubDate),
		updated: processDate(updateDate),
		link: `${rootUrl}${url}`,
		content: {
			html: description,
			text: summary
		},
		category: [tag]
	};
}
function processDate(date) {
	return parseDate(date.trim().replaceAll(" ", "/").replace(",", ""), "MMMM/Do/YYYY", "en");
}
//#endregion
export { processList as n, rootUrl as r, getRelativeUrlList as t };
