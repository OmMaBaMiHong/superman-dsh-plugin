import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wallhaven/index.ts
const rootUrl = "https://wallhaven.cc";
const route = {
	path: ["/search/:filter?/:needDetails?", "/:filter?/:needDetails?"],
	categories: ["picture"],
	example: "/wallhaven/search/categories=110&purity=110&sorting=date_added&order=desc",
	parameters: {
		filter: "Filter, empty by default",
		needDetails: "Need Details, `true`/`yes` as yes, no by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wallhaven.cc/"] }],
	name: "Search",
	maintainers: ["nczitzk", "Fatpandac"],
	handler,
	url: "wallhaven.cc/",
	description: `::: tip
Subscribe pages starting with \`https://wallhaven.cc/search\`, fill the text after \`?\` as \`filter\` in the route. The following is an example:

The text after \`?\` is \`q=id%3A711&sorting=random&ref=fp&seed=8g0dgd\` for [Wallpaper Search: #landscape - wallhaven.cc](https://wallhaven.cc/search?q=id%3A711\\&sorting=random\\&ref=fp\\&seed=8g0dgd), so the route is [/wallhaven/q=id%3A711\\&sorting=random\\&ref=fp\\&seed=8g0dgd](https://rsshub.app/wallhaven/q=id%3A711\\&sorting=random\\&ref=fp\\&seed=8g0dgd)
:::`
};
async function handler(ctx) {
	const filter = ctx.req.param("filter") ?? "latest";
	const needDetails = /t|y/i.test(ctx.req.param("needDetails") ?? "false");
	const url = `${rootUrl}/${filter.indexOf("=") > 0 ? `search?${filter.replaceAll(/page=\d+/g, "page=1")}` : filter}`;
	const $ = load((await got_default.get(url)).data);
	let items = $("li > figure.thumb").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 24).toArray().map((item) => ({
		title: $(item).find("img.lazyload").attr("data-src").split("/").pop(),
		description: $(item).html().match(/<img.*?>/)[0],
		link: $(item).find("a.preview").attr("href")
	}));
	if (needDetails) items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("meta[name=\"title\"]").attr("content");
		item.author = content(".username").text();
		item.pubDate = parseDate(content("time").attr("datetime"));
		item.category = content(".tagname").toArray().map((tag) => content(tag).text());
		item.description = content("div.scrollbox").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
