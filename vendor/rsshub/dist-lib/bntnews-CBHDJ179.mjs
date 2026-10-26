import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/bntnews/index.ts
const categories = {
	bnt003000000: "Beauty",
	bnt002000000: "Fashion",
	bnt004000000: "Star",
	bnt007000000: "Style+",
	bnt009000000: "Photo",
	bnt005000000: "Life",
	bnt008000000: "Now"
};
const route = {
	path: "/:category?",
	categories: ["new-media"],
	example: "/bntnews/bnt003000000",
	parameters: { category: "Category ID, see table below, default to Now (bnt008000000)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["iamsnn"],
	handler,
	description: `| Beauty       | Fashion      | Star         | Style+       | Photo        | Life         | Now          |
| ------------ | ------------ | ------------ | ------------ | ------------ | ------------ | ------------ |
| bnt003000000 | bnt002000000 | bnt004000000 | bnt007000000 | bnt009000000 | bnt005000000 | bnt008000000 |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") || "bnt008000000";
	const rootUrl = "https://www.bntnews.co.kr";
	const currentUrl = `${rootUrl}/article/list/${category}`;
	const list = ((await got_default({
		method: "get",
		url: currentUrl,
		searchParams: { returnType: "ajax" }
	})).data.result?.items || []).map((article) => {
		const link = `${rootUrl}/article/view/${article.aid}`;
		return {
			title: article.title,
			link,
			description: article.content,
			pubDate: timezone(parseDate(article.firstPublishDate), 9),
			author: article.reporter?.[0]?.name || ""
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const $content = content(".body_wrap .content");
		$content.find(".googleBanner").remove();
		$content.find("script").remove();
		$content.find("style").remove();
		if ($content.length > 0) item.description = $content.html();
		else {
			const $articleView = content(".article_view");
			if ($articleView.length > 0) item.description = $articleView.html();
		}
		return item;
	})));
	return {
		title: `bntnews - ${categories[category] || category}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
