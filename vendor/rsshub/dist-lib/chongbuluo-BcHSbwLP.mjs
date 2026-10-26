import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/chongbuluo/index.ts
const route = {
	path: "/newthread",
	categories: ["bbs"],
	example: "/chongbuluo/newthread",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.chongbuluo.com/"] }],
	name: "最新发表",
	maintainers: ["qiye45"],
	handler
};
async function handler() {
	const baseUrl = "https://www.chongbuluo.com";
	const link = `${baseUrl}/forum.php?mod=guide&view=newthread`;
	const $ = load(await rofetch(link));
	return {
		title: "虫部落 - 最新发表",
		link,
		description: "虫部落最新发表的帖子",
		item: await Promise.all($("#threadlist tbody[id^=\"normalthread_\"]").toArray().map(async (element) => {
			const item = $(element);
			const titleElement = item.find("th.common a.xst");
			const title = titleElement.text().trim();
			const href = titleElement.attr("href") || "";
			const threadLink = href.startsWith("http") ? href : `${baseUrl}/${href}`;
			const author = item.find("td.by cite a").text().trim();
			const pubDate = parseDate(item.find("td.by em a span").attr("title") || item.find("td.by em a").text().trim());
			return await cache_default.tryGet(threadLink, async () => {
				try {
					const content = load(await rofetch(threadLink))(".t_f").first().html()?.trim() || "";
					return {
						title,
						link: threadLink,
						description: content,
						pubDate,
						author
					};
				} catch {
					return {
						title,
						link: threadLink,
						description: "内容获取失败",
						pubDate,
						author
					};
				}
			});
		}))
	};
}
//#endregion
export { route };
