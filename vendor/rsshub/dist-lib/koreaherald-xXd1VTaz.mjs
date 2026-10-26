import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/koreaherald/index.ts
const route = {
	path: "/:category{.+}?",
	categories: ["traditional-media"],
	example: "/koreaherald/National",
	parameters: { category: "Category from the path of the URL of the corresponding site, `National` by default" },
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: false
	},
	name: "News",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: `::: tip
For example, the category for the page <https://www.koreaherald.com/Business> and <https://www.koreaherald.com/Business/Market> would be \`/Business\` and \`/Business/Market\` respectively.
:::`,
	radar: [{
		source: ["www.koreaherald.com/:category"],
		target: "/:category"
	}]
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "National";
	const baseUrl = "https://www.koreaherald.com/";
	const $ = load((await got_default(new URL(category, baseUrl).href)).data);
	const title = $("ul.gnb").find("[class=\"on\"]").length > 0 ? $("ul.gnb").find("[class=\"on\"]").text() : $("div.nav_area > a.category").text();
	const list = $("article.recent_news > ul.news_list > li").toArray().map((item) => new URL($(item).find("a").attr("href"), baseUrl).href);
	const items = await Promise.all(list.map((url) => cache_default.tryGet(url, async () => {
		const $ = load((await got_default(url)).data);
		const metadata = JSON.parse($("[type=\"application/ld+json\"]").text());
		return {
			title: metadata.headline,
			link: url,
			pubDate: timezone(parseDate(metadata.datePublished), 9),
			author: metadata.author.name,
			description: $("article.article-body").html()
		};
	})));
	return {
		title: `The Korea Herald - ${title}`,
		link: new URL(category, baseUrl).href,
		item: items
	};
}
//#endregion
export { route };
