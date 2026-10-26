import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/fanqienovel/page.ts
const route = {
	path: "/page/:bookId",
	example: "/fanqienovel/page/6621052928482348040",
	parameters: { bookId: "小说 ID，可在 URL 中找到" },
	maintainers: ["TonyRL"],
	name: "小说更新",
	handler,
	radar: [{ source: ["fanqienovel.com/page/:bookId"] }]
};
async function handler(ctx) {
	const { bookId } = ctx.req.param();
	const link = `https://fanqienovel.com/page/${bookId}`;
	const response = await rofetch(link);
	const $ = cheerio.load(response);
	const page = JSON.parse($("script:contains(\"window.__INITIAL_STATE__\")").text().match(/window\.__INITIAL_STATE__\s*=\s*(\S.*);/)?.[1] ?? "{}").page;
	const items = page.chapterListWithVolume.flatMap((volume) => volume.map((chapter) => ({
		title: chapter.title,
		link: `https://fanqienovel.com/reader/${chapter.itemId}`,
		description: chapter.volume_name,
		pubDate: parseDate(chapter.firstPassTime, "X"),
		author: page.author
	})));
	return {
		title: `${page.bookName} - ${page.author}`,
		description: page.abstract,
		link,
		language: "zh-CN",
		image: page.thumbUri,
		item: items
	};
}
//#endregion
export { route };
