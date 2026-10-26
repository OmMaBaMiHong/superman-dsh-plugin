import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/ciidbnu/index.ts
const route = {
	path: "/:id?",
	categories: ["new-media"],
	example: "/ciidbnu",
	parameters: { id: "分类 id，可在分类页地址栏 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["nczitzk"],
	handler,
	description: `| 社会动态 | 院内新闻 | 学术观点 | 文献书籍 | 工作论文 | 专题讨论 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 1        | 5        | 3        | 4        | 6        | 8        |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "1";
	const rootUrl = "http://www.ciidbnu.org";
	const currentUrl = `${rootUrl}/new1.asp?pagetype=${id}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $("#newsrightlist a").slice(0, 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}${item.attr("href").replace("..", "")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link,
			responseType: "buffer"
		});
		const content = load(iconv.decode(detailResponse.data, "gbk"));
		item.description = content("#text").html();
		item.pubDate = timezone(parseDate(content(".t8").eq(0).text(), "YYYY/M/D H:mm:ss"), 8);
		content(".t14").remove();
		item.author = content("#author").text();
		return item;
	})));
	return {
		title: `${$("h3").text()} - 中国收入分配研究院`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
