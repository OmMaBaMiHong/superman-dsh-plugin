import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as header } from "./utils-BpoeGnFo.mjs";
//#region lib/routes/zhihu/daily-section.ts
const route = {
	path: "/daily/section/:sectionId",
	categories: ["social-media"],
	example: "/zhihu/daily/section/2",
	parameters: { sectionId: "合集 id，可在 https://news-at.zhihu.com/api/7/sections 找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["daily.zhihu.com/*"],
		target: "/daily"
	}],
	name: "知乎日报 - 合集",
	maintainers: ["ccbikai"],
	handler,
	url: "daily.zhihu.com/*"
};
async function handler(ctx) {
	const sectionId = ctx.req.param("sectionId");
	const listRes = await rofetch(`https://news-at.zhihu.com/api/7/section/${sectionId}`, { headers: {
		...header,
		Referer: `https://news-at.zhihu.com/api/7/section/${sectionId}`
	} });
	const storyList = listRes.stories.filter((el) => el.url.startsWith("https://daily.zhihu.com/"));
	const resultItem = await Promise.all(storyList.map(async (story) => {
		const url = "https://news-at.zhihu.com/api/7/news/" + story.id;
		const storyJson = await cache_default.tryGet(url, async () => {
			return await rofetch(url);
		});
		return {
			title: storyJson.title,
			description: storyJson.body,
			link: storyJson.url,
			pubDate: parseDate(storyJson.publish_time, "X")
		};
	}));
	return {
		title: `${listRes.name} - 知乎日报`,
		link: "https://daily.zhihu.com",
		description: "每天3次，每次7分钟",
		image: "http://static.daily.zhihu.com/img/new_home_v3/mobile_top_logo.png",
		item: resultItem
	};
}
//#endregion
export { route };
