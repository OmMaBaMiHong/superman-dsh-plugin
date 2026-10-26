import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/sfacg/novel-chapter.ts
const route = {
	path: "/novel/chapter/:id",
	categories: ["reading"],
	example: "/sfacg/novel/chapter/672431",
	parameters: { id: "小说 id, 可在对应小说页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["book.sfacg.com/Novel/:id/*"] }],
	name: "章节",
	maintainers: ["keocheung"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	const baseUrl = "https://book.sfacg.com";
	const { data: response } = await got_default(`${baseUrl}/Novel/${id}/MainIndex/`);
	const $ = load(response);
	const list = $("div.catalog-list ul li a").slice(-limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: `${baseUrl}${item.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		item.description = $("div.article-content").html();
		item.pubDate = timezone(parseDate($("div.article-desc span").eq(1).text().replace("更新时间：", "")), 8);
		return item;
	})));
	const { data: intro } = await got_default(`${baseUrl}/Novel/${id}/`);
	const $i = load(intro);
	return {
		title: `SF轻小说 ${$("h1.story-title").text()}`,
		link: `${baseUrl}/Novel/${id}`,
		description: $i("p.introduce").text(),
		image: $i("div.summary-pic img").attr("src").replace("http://", "https://"),
		item: items
	};
}
//#endregion
export { route };
