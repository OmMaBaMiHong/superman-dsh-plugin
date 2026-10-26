import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/grubstreet/utils.ts
async function loadContent(link) {
	const description = load((await got_default(link)).data)("div.article-content");
	description.find("aside.related").remove();
	description.find("aside.article-details_heading-with-paragraph").remove();
	description.find("section.package-list").remove();
	description.find("div.source-links h2").remove();
	description.find("div.source-links svg").remove();
	description.find("div.mobile-secondary-area").remove();
	description.find("aside.newsletter-flex-text").remove();
	return { description: description.html() };
}
function ProcessFeed(list, caches) {
	return Promise.all(list.map((item) => caches.tryGet(item.canonicalUrl, async () => {
		const itemUrl = item.canonicalUrl.replace("http://", "https://");
		let bylineString;
		if (item.byline) {
			const byline = item.byline[0];
			if (byline && byline.names) {
				const bylineNames = byline.names.map((name) => name.text);
				if (bylineNames && bylineNames.length > 0) bylineString = "by " + bylineNames.join(", ");
			}
		}
		const single = {
			title: item.plaintextPrimaryHeadline,
			link: itemUrl,
			guid: itemUrl,
			pubDate: item.date
		};
		if (bylineString) single.author = bylineString;
		const { description } = await loadContent(itemUrl);
		single.description = description;
		return single;
	})));
}
const getData = async (ctx, url, title, description) => {
	return {
		title,
		link: url,
		description,
		item: await ProcessFeed((await got_default(url)).data.articles.slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 25), cache_default)
	};
};
var utils_default = { getData };
//#endregion
//#region lib/routes/grubstreet/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["grubstreet.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["loganrockmore"],
	handler,
	url: "grubstreet.com/"
};
async function handler(ctx) {
	return await utils_default.getData(ctx, "https://www.grubstreet.com/_components/newsfeed/instances/grubstreet-index@published", "Grub Street", `New York Magazine's Food and Restaurant Blog`);
}
//#endregion
export { route };
