import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/dnaindia/common.ts
async function handler(ctx) {
	const { category, topic } = ctx.req.param();
	const baseUrl = "https://www.dnaindia.com";
	let route;
	if (category) route = `/${category}`;
	else if (topic) route = `/topic/${topic}`;
	else logger.error("Invalid URL");
	const link = `${baseUrl}${route}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const listItems = $("div.list-news").toArray().map((item) => {
		item = $(item);
		const a = item.find("div.explainer-subtext a");
		return {
			title: a.text(),
			link: `${baseUrl}${a.attr("href")}`
		};
	});
	return {
		title: "DNA India",
		link,
		item: await Promise.all(listItems.map((item) => cache_default.tryGet(item.link, async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			const itunes_item_image = $("div.article-img img").attr("src");
			const category = $("div.tags ul li").toArray().map((item) => $(item).find("a").text());
			const dateMatch = $("p.dna-update").text().match(/Updated\s*:([\w\s,:]+)/);
			let time = dateMatch ? dateMatch[1].trim() : "";
			time = time.replace(/\s+IST$/, "");
			const pubDate = timezone(parseDate(time), 5.5);
			const author = $("meta[name=\"author\"]").attr("content") || "DNA Web Team";
			const description = $("div.article-description").clone().children("div").remove().end().toArray().map((element) => $(element).html()).join("");
			return {
				...item,
				itunes_item_image,
				category,
				pubDate,
				author,
				description
			};
		}))),
		description: "Latest News on dnaIndia.com",
		logo: "https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico",
		icon: "https://cdn.dnaindia.com/sites/all/themes/dnaindia/favicon-1016.ico",
		language: "en-us"
	};
}
//#endregion
export { handler as t };
