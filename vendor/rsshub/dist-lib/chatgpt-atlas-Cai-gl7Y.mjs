import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/openai/chatgpt-atlas.ts
const route = {
	path: "/chatgpt-atlas/release-notes",
	categories: ["program-update"],
	example: "/openai/chatgpt-atlas/release-notes",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "ChatGPT Atlas - Release Notes",
	maintainers: ["xbot"],
	handler
};
async function handler() {
	const articleUrl = "https://help.openai.com/en/articles/12591856-chatgpt-atlas-release-notes";
	const cacheIn = await cache_default.tryGet(articleUrl, async () => {
		const $ = load(await rofetch(articleUrl));
		const articleContent = $(".article-content");
		if (articleContent.length === 0) throw new Error("Failed to find article content.");
		return {
			feedTitle: $("h1").first().text(),
			feedDesc: "ChatGPT Atlas Release Notes",
			items: $("h1", articleContent).toArray().map((element) => {
				const $h1 = $(element);
				const text = $h1.text().trim();
				const dateMatch = text.match(/(\w+\s+\d+[stndrh]*,\s+\d{4})/i);
				let pubDate;
				if (dateMatch) {
					const dateStr = dateMatch[1];
					const parsedDate = dayjs(dateStr, ["MMMM Do, YYYY", "MMMM D, YYYY"], "en");
					if (parsedDate.isValid()) pubDate = parsedDate.toDate();
				}
				const description = $h1.nextUntil("h1").toArray().map((el) => $(el).prop("outerHTML")).join("");
				return {
					guid: `${articleUrl}#${pubDate ? pubDate.getTime() : text}`,
					title: text,
					link: articleUrl,
					pubDate,
					description
				};
			})
		};
	}, config.cache.routeExpire, false);
	return {
		title: cacheIn.feedTitle,
		description: cacheIn.feedDesc,
		link: articleUrl,
		item: cacheIn.items
	};
}
//#endregion
export { route };
