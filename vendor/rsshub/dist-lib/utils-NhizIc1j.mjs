import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/line/utils.ts
const baseUrl = "https://today.line.me";
const parseList = (items) => items.map((item) => ({
	title: item.title,
	link: item.url.url,
	pubDate: parseDate(item.publishTimeUnix),
	hash: item.url.hash,
	category: item.categoryName
}));
const parseItems = (list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	const edition = item.link.match(/today\.line\.me\/(\w+)\/v[23]\/.*$/)[1];
	let data;
	try {
		data = (await got_default(`${baseUrl}/webapi/portal/page/setting/article`, { searchParams: {
			country: edition,
			hash: item.hash,
			group: "NA"
		} })).data;
	} catch (error) {
		if ((error.name === "HTTPError" || error.name === "FetchError") && error.response.statusCode === 404) {
			logger.error(`Error parsing article ${item.link}: ${error.message}`);
			return item;
		}
		throw error;
	}
	const $ = load(data.data.content, null, false);
	$("img").each((_, img) => {
		delete img.attribs["data-hashid"];
		img.attribs.src = img.attribs.src.replace(/\/w\d+$/, "");
	});
	item.description = $.html();
	item.author = data.data.author;
	item.category = [.../* @__PURE__ */ new Set([item.category, ...data.data.exploreLinks.map((link) => link.name)])];
	return item;
})));
//#endregion
export { parseItems as n, parseList as r, baseUrl as t };
