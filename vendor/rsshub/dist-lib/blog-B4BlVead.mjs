import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/cockroachlabs/blog.ts
const route = {
	name: "Blogs",
	maintainers: ["CookiePieWw"],
	categories: ["programming"],
	path: "/blog/:category?",
	example: "/cockroachlabs/blog/engineering",
	parameters: { category: "Blog category, e.g., engineering. Subscribe all recent articles if empty." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cockroachlabs.com/blog/:category", "cockroachlabs.com/blog"],
		target: "/blog"
	}],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const rootUrl = "https://www.cockroachlabs.com";
	const currentUrl = `${rootUrl}/blog${category ? `/${category}/` : "/"}`;
	const html = load(await rofetch(currentUrl));
	const titleH2Element = html("[class=\"mb-3 truncate text-display-md font-semibold tracking-tight md:max-w-full md:text-white\"]");
	const leftArticles = html("a > p[class=\"mb-2 line-clamp-2 text-lg font-semibold leading-5\"]");
	const articleList = titleH2Element.add(leftArticles).map((_, element) => {
		return {
			title: html(element).text(),
			link: `${rootUrl}${html(element).parent("a").attr("href")}`
		};
	});
	const items = await Promise.all(articleList.toArray().map((article) => cache_default.tryGet(article.link, async () => {
		const $ = load(await rofetch(article.link));
		const content = $("article.blog-content").html() || "";
		const dateText = $(String.raw`div.mt-4.flex.flex-col.items-center.justify-center.gap-1.sm\:flex-row.sm\:gap-4`).find("p").first().text().match(/Last edited on (.+)/)?.[1];
		let pubDate;
		if (dateText) try {
			const date = new Date(dateText);
			if (!Number.isNaN(date.getTime())) pubDate = parseDate(date.toISOString().split("T", 1)[0]);
		} catch {}
		return {
			title: article.title,
			link: article.link,
			description: content,
			pubDate
		};
	})));
	return {
		title: `Cockroach Labs Blog${category ? ` - ${category}` : ""}`,
		link: currentUrl,
		item: items,
		description: "Cockroach Labs Blog"
	};
}
//#endregion
export { route };
