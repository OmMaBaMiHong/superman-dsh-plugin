import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nikkei/asia/index.ts
const route = {
	path: "/asia",
	categories: ["traditional-media"],
	example: "/nikkei/asia",
	radar: [{ source: ["asia.nikkei.com/"] }],
	name: "Nikkei Asia Latest News",
	maintainers: ["rainrdx"],
	handler,
	url: "asia.nikkei.com"
};
async function handler() {
	const list = (await got_default({
		method: "get",
		url: "https://asia.nikkei.com/api/__service/next_api/v1/graphql",
		searchParams: {
			operationName: "GetLatestHeadlinesStream",
			variables: "{}",
			extensions: "{\"persistedQuery\":{\"version\":1,\"sha256Hash\":\"287aed8784a3f55ad444bb6b550ebdafb40b0da60c7800081e7343d889975fe8\"}}"
		},
		headers: { "content-type": "application/json" }
	})).data.data.getLatestHeadlines.items.map((item) => ({
		...item,
		link: new URL(item.path, "https://asia.nikkei.com").href
	}));
	return {
		title: "Nikkei Asia",
		link: "https://asia.nikkei.com",
		image: "https://main-asianreview-nikkei.content.pugpig.com/pugpig_assets/admin/pub120x120.jpg",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const title = item.name;
			const pubDate = parseDate(item.displayDate * 1e3);
			const category = item.primaryTag.name;
			const $ = load((await got_default(item.link)).data);
			const description = $("div[class^=\"NewsArticle_newsArticleContentContainerWrapper\"]").html() || "";
			const author = $("div[class^=\"NewsArticleDetails_newsArticleDetailsByline\"]").text() || "";
			return {
				title,
				pubDate,
				category,
				description,
				link: item.link,
				author
			};
		})))
	};
}
//#endregion
export { route };
