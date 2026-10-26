import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/9to5/utils.ts
const ProcessFeed = (data) => {
	const $ = load(data);
	const content = $("div.post-content");
	const cover = $("meta[property=\"og:image\"]");
	if (cover.length > 0) $(`<img src=${cover[0].attribs.content}>`).insertBefore(content[0].firstChild);
	content.find("hr").nextAll().remove();
	content.find("hr, ins.adsbygoogle, script").each((i, e) => {
		$(e).remove();
	});
	content.find("div.ad-disclaimer-container").remove();
	content.find("div").each((i, e) => {
		if (!$(e)[0].attribs.class) return;
		const classes = $(e)[0].attribs.class;
		if (/\w{10}\s\w{10}/.test(classes)) $(e).remove();
	});
	return content.html();
};
var utils_default = { ProcessFeed };
//#endregion
//#region lib/routes/9to5/subsite.ts
const route = {
	path: "/:subsite/:tag?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	let title = "9To5", link, description;
	switch (ctx.req.param("subsite")) {
		case "mac":
			link = "https://9to5mac.com";
			title += "Mac";
			description = "Apple News & Mac Rumors Breaking All Day";
			break;
		case "google":
			link = "https://9to5google.com";
			title += "Google";
			description = "Google, Pixel news, Android, Home, Chrome OS, apps, more";
			break;
		case "toys":
			link = "https://9to5toys.com";
			title += "Toys";
			description = "New Gear, reviews and deals";
			break;
		default: break;
	}
	if (ctx.req.param("tag")) {
		link += `/guides/${ctx.req.param("tag")}/feed/`;
		title = `${ctx.req.param("tag")} | ${title}`;
	} else link += "/feed/";
	const feed = await parser.parseURL(link);
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10;
	const items = await Promise.all(feed.items.splice(0, limit).map((item) => cache_default.tryGet(item.link, async () => {
		const response = await got_default({
			method: "get",
			url: item.link
		});
		const description = utils_default.ProcessFeed(response.data);
		return {
			title: item.title,
			description,
			pubDate: item.pubDate,
			link: item.link,
			author: item["dc:creator"]
		};
	})));
	return {
		title,
		link,
		description,
		item: items
	};
}
//#endregion
export { route };
