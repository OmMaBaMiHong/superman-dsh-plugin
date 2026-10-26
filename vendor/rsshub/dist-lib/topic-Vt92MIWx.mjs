import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/bangumi.tv/group/topic.ts
const baseUrl = "https://bgm.tv";
const route = {
	path: "/group/:id",
	categories: ["anime"],
	example: "/bangumi.tv/group/boring",
	parameters: { id: "小组 id, 在小组页面地址栏查看" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bgm.tv/group/:id"] }],
	name: "小组话题",
	maintainers: ["SettingDust"],
	handler
};
async function handler(ctx) {
	const groupID = ctx.req.param("id");
	const link = `${baseUrl}/group/${groupID}/forum`;
	const $ = load(await rofetch(link));
	return {
		title: "Bangumi - " + $(".SecondaryNavTitle").text(),
		link,
		item: await Promise.all($(".topic_list .topic").toArray().map((elem) => {
			const link = new URL($(".subject a", elem).attr("href"), baseUrl).href;
			return cache_default.tryGet(link, async () => {
				const $ = load(await rofetch(link));
				const fullText = $(".postTopic .topic_content").html();
				const summary = "Reply: " + $(".posts", elem).text();
				return {
					link,
					title: $(".subject a", elem).attr("title"),
					pubDate: parseDate($(".lastpost .time", elem).text()),
					description: fullText ? summary + "<br><br>" + fullText : summary,
					author: $(".author a", elem).text()
				};
			});
		}))
	};
}
//#endregion
export { route };
