import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/gamme/category.ts
const route = {
	path: "/:domain/:category?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { domain = "news", category } = ctx.req.param();
	if (!isValidHost(domain)) throw new InvalidParameterError("Invalid domain");
	const baseUrl = `https://${domain}.gamme.com.tw`;
	const feed = await parser.parseURL(`${baseUrl + (category ? `/category/${category}` : "")}/feed`);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		const $ = load(data);
		$(".entry img").each((_, img) => {
			if (!(img.attribs["data-original"] || img.attribs["data-src"])) return;
			img.attribs.src = img.attribs["data-original"] || img.attribs["data-src"];
			delete img.attribs["data-original"];
			delete img.attribs["data-src"];
		});
		item.author = $(".author_name").text().trim();
		item.category = $(".tags a").toArray().map((tag) => $(tag).text());
		$(".social_block, .tags").remove();
		item.description = $(".entry").html();
		delete item.content;
		delete item.contentSnippet;
		delete item.isoDate;
		return item;
	})));
	return {
		title: feed.title,
		link: feed.link,
		image: domain === "news" ? `${baseUrl}/blogico.ico` : `${baseUrl}/favicon.ico`,
		description: feed.description,
		item: items
	};
}
//#endregion
export { route };
