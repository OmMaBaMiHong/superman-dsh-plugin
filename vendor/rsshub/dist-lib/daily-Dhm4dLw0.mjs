import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/zhihu/daily.ts
const route = {
	path: "/daily",
	categories: ["social-media"],
	example: "/zhihu/daily",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["daily.zhihu.com/*"] }],
	name: "知乎日报",
	maintainers: ["DHPO", "pseudoyu"],
	handler,
	url: "daily.zhihu.com/*"
};
async function handler() {
	const $ = load(await rofetch("https://daily.zhihu.com/"));
	return {
		title: "知乎日报",
		link: "https://daily.zhihu.com",
		description: "每天3次，每次7分钟",
		image: "http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png",
		item: (await Promise.all($(".box").toArray().map(async (item) => {
			item = $(item);
			const storyUrl = "https://daily.zhihu.com/api/4" + item.find(".link-button").attr("href");
			try {
				const storyJson = await cache_default.tryGet(storyUrl, async () => {
					return await rofetch(storyUrl);
				});
				return {
					title: storyJson.title,
					description: storyJson.body,
					link: storyJson.url,
					image: storyJson.image,
					pubDate: storyJson.publish_time ? parseDate(storyJson.publish_time, "X") : void 0
				};
			} catch (error) {
				logger.debug(`Failed to fetch story detail: ${storyUrl} - ${error instanceof Error ? error.message : String(error)}`);
				return null;
			}
		}))).filter(Boolean)
	};
}
//#endregion
export { route };
