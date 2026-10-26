import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cdi/index.ts
const route = {
	path: "/:id?",
	categories: ["new-media"],
	example: "/cdi",
	parameters: { id: "分类，见下表，默认为综研国策" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "栏目",
	maintainers: ["nczitzk"],
	handler,
	description: `| 樊纲观点 | 综研国策 | 综研观察 | 综研专访 | 综研视点 | 银湖新能源 |
| -------- | -------- | -------- | -------- | -------- | ---------- |
| 102      | 152      | 150      | 153      | 154      | 151        |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "152";
	const rootUrl = "http://www.cdi.com.cn";
	const currentUrl = `${rootUrl}/Article/List?ColumnId=${id}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".a-full").toArray().map((item) => {
		item = $(item);
		return { link: `${rootUrl}${item.attr("href")}` };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("h1").text();
		item.description = content("#info").html();
		item.pubDate = timezone(parseDate(content(".head p").text().match(/时间：(.*)/)[1].replaceAll(/年|月/g, "-")), 8);
		return item;
	})));
	return {
		title: `${$("h1").text()} - 国家高端智库/综合开发研究院`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
