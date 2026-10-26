import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as data_default, t as index } from "./extractor-f-DRFfdP.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/wh/news.ts
const route = {
	path: "/wh/news/:column?",
	categories: ["university"],
	example: "/sdu/wh/news/xyyw",
	parameters: { column: "专栏名称，默认为校园要闻（`xyyw`）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻网",
	maintainers: ["kxxt"],
	handler,
	description: `| 校园要闻 | 学生动态 | 综合新闻 | 山大视点 | 菁菁校园 | 校园简讯 | 玛珈之窗 | 热点专题 | 媒体视角 | 高教视野 | 理论学习 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| xyyw     | xsdt     | zhxw     | sdsd     | jjxy     | xyjx     | mjzc     | rdzt     | mtsj     | gjsy     | llxx     |`
};
async function handler(ctx) {
	const column = ctx.req.param("column") ?? "xyyw";
	const baseUrl = data_default.wh.news.url;
	const $ = load((await got_default(baseUrl + data_default.wh.news.columns[column].url)).data);
	const items = $(".n_newslist li");
	const out = await Promise.all(items.map(async (index$1, item) => {
		item = $(item);
		const anchor = item.find("a");
		const title = anchor.attr("title");
		const href = anchor.attr("href");
		const link = href.startsWith("http") ? href : baseUrl + href;
		const { description, author, exactDate } = await cache_default.tryGet(link, () => index(link));
		const span = item.find("span");
		return {
			title,
			link,
			description,
			pubDate: exactDate ?? parseDate(span.text(), "YYYY/MM/DD"),
			author
		};
	}));
	return {
		title: `${data_default.wh.news.name} ${data_default.wh.news.columns[column].name}`,
		link: baseUrl + data_default.wh.news.columns[column].url,
		item: out
	};
}
//#endregion
export { route };
