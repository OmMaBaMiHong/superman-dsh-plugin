import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zongheng/detail.ts
const route = {
	path: "/detail/:id",
	categories: ["reading"],
	example: "/zongheng/detail/1366535",
	parameters: { id: "作品 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.zongheng.org/detail/:id"] }],
	name: "章节更新",
	maintainers: ["TonyRL"],
	handler,
	url: "www.zongheng.com"
};
async function handler(ctx) {
	const { id } = ctx.req.param();
	const link = `https://www.zongheng.com/detail/${id}`;
	const $ = load(await rofetch(link));
	const description = JSON.parse($("script:contains(\"window.__NUXT__\")").text().match(/description:(.*?),totalWords/)?.[1] || "\"\"").replaceAll("<br>", " ");
	const category = $(".book-info--tags span").toArray().map((tag) => $(tag).text().trim());
	const author = $(".author-info--name").text().trim();
	const items = (await rofetch("https://bookapi.zongheng.com/api/chapter/getChapterList", {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({ bookId: id })
	})).result.chapterList.flatMap((list) => list.chapterViewList.map((chapter) => ({
		title: `${list.tome.tomeName ? `${list.tome.tomeName} - ` : ""}${chapter.chapterName}`,
		link: `https://read.zongheng.com/chapter/${id}/${chapter.chapterId}.html`,
		pubDate: timezone(parseDate(chapter.createTime), 8),
		guid: `zongheng:${id}:${list.tome.tomeId}:${chapter.chapterId}`,
		author,
		category
	})));
	return {
		title: `${$(".book-info--title span").text()}（${author}）- 纵横中文网`,
		description: `${$(".book-info--nums").text().trim()} ${description}`,
		link,
		allowEmpty: true,
		image: $(".book-info--coverImage-img").attr("src"),
		item: items
	};
}
//#endregion
export { route };
