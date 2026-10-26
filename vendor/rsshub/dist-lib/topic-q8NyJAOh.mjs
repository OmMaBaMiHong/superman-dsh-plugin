import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/oschina/topic.ts
async function loadContent(link) {
	return load((await got_default(link)).data);
}
const route = {
	path: "/topic/:topic",
	categories: ["programming"],
	example: "/oschina/topic/weekly-news",
	parameters: { topic: "主题名，可从 [全部主题](https://www.oschina.net/question/topics) 进入主题页，在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["oschina.net/question/topic/:topic"] }],
	name: "问答主题",
	maintainers: ["loveely7"],
	handler
};
async function handler(ctx) {
	const topicUrl = `https://www.oschina.net/question/topic/${ctx.req.param("topic")}?show=time`;
	const $ = await loadContent(topicUrl);
	const topicName = $(".topic-info > .topic-header > h3").text();
	const list = $("#questionList .question-item").toArray().map((item) => {
		item = $(item);
		const date = item.find(".extra > .list > .item:nth-of-type(2)").text();
		return {
			title: item.find(".header").text(),
			description: item.find(".description").html(),
			link: item.find(".header").attr("href"),
			author: item.find(".extra > .list > .item:nth-of-type(1)").text(),
			pubDate: timezone(/\//.test(date) ? parseDate(date, ["YYYY/MM/DD HH:mm", "MM/DD HH:mm"]) : parseRelativeDate(date), 8)
		};
	});
	const resultItem = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const content = await loadContent(item.link);
			content(".ad-wrap").remove();
			item.description = content("#articleContent").html();
		} catch {}
		return item;
	})));
	return {
		title: `开源中国-${topicName}`,
		description: $(".topic-introduction").text(),
		link: topicUrl,
		item: resultItem
	};
}
//#endregion
export { route };
