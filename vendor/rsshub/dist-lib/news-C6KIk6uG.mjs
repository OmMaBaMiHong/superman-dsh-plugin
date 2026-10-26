import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zjut/news.ts
const host = "http://www.news.zjut.edu.cn";
const route = {
	path: "/news/:type",
	categories: ["university"],
	example: "/zjut/news/5414",
	parameters: { type: "分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "浙工大新闻",
	maintainers: ["junbaor", "yikZero"],
	url: "www.news.zjut.edu.cn",
	handler,
	radar: [{ source: ["www.news.zjut.edu.cn/:type/list.htm"] }],
	description: `| 图片新闻 | 工大要闻 | 综合新闻 | 学术・探索 | 三创・人物 | 智库工大 | 美誉工大 | 葵园融媒 |
| -------- | -------- | -------- | ---------- | ---------- | -------- | -------- | -------- |
| 5414     | 5415     | 5416     | 5422       | 5423       | 5424     | 5425     | 5419     |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const $ = load((await got_default(`${host}/${type}/list.htm`, { responseType: "buffer" })).data);
	const list = $("#l-container .news_list > li.news").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").text();
		const link = item.find("a").attr("href");
		return {
			title,
			description: "",
			pubDate: parseDate(item.find("span[class='news_meta']").text()),
			link
		};
	});
	const items = await Promise.all(list.map((item) => {
		if (item.link.startsWith("http")) {
			item.description = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.link}</a>`;
			return item;
		}
		return cache_default.tryGet(`${host}${item.link}`, async () => {
			const $ = load((await got_default(`${host}${item.link}`)).data);
			item.link = `${host}${item.link}`;
			item.description = $("div[class=\"wp_articlecontent\"]").html();
			return item;
		});
	}));
	return {
		title: `${$(".col_title h2").text()} - 浙江工业大学`,
		link: `${host}/${type}/list.htm`,
		item: items
	};
}
//#endregion
export { route };
