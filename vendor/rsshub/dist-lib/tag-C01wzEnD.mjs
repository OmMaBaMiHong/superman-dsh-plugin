import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/udn/global/tag.ts
const route = {
	path: "/global/tag/:tag?",
	categories: ["traditional-media"],
	example: "/udn/global/tag/過去24小時",
	parameters: { tag: "标签，可在对应标签页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["global.udn.com/search/tagging/1020/:tag", "global.udn.com/"] }],
	name: "轉角國際 - 標籤",
	maintainers: [
		"emdoe",
		"nczitzk",
		"pseudoyu"
	],
	handler,
	description: `| 過去 24 小時 | 鏡頭背後 | 深度專欄 | 重磅廣播 |
| ------------ | -------- | -------- | -------- |`
};
async function handler(ctx) {
	const tag = ctx.req.param("tag") ?? "過去24小時";
	const rootUrl = "https://global.udn.com";
	const currentUrl = `${rootUrl}/search/tagging/1020/${tag}`;
	let items = (await got_default({
		method: "get",
		url: `${rootUrl}/global_vision/load/article/newest/tag:${tag}`
	})).data.lists.map((item) => ({
		title: item.title,
		author: item.author?.title,
		pubDate: timezone(parseDate(item.time?.dateTime), 8),
		link: item.url,
		category: item.hash?.map((h) => h.title)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = content(".article-content__focus").html() + content(".article-content__editor").find("p, figure, h2, .video-container").toArray().map((e) => content.html(e)).join("");
		return item;
	})));
	return {
		title: `轉角國際 udn Global - ${tag}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
