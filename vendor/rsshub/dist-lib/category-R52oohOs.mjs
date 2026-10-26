import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bookfere/category.ts
const route = {
	path: "/:category",
	categories: ["reading"],
	view: 0,
	example: "/bookfere/skills",
	parameters: { category: {
		description: "分类名",
		options: [
			{
				value: "weekly",
				label: "每周一书"
			},
			{
				value: "skills",
				label: "使用技巧"
			},
			{
				value: "books",
				label: "图书推荐"
			},
			{
				value: "news",
				label: "新闻速递"
			},
			{
				value: "essay",
				label: "精选短文"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["OdinZhang"],
	handler,
	description: `| 每周一书 | 使用技巧 | 图书推荐 | 新闻速递 | 精选短文 |
| -------- | -------- | -------- | -------- | -------- |
| weekly   | skills   | books    | news     | essay    |`
};
async function handler(ctx) {
	const url = "https://bookfere.com/category/" + ctx.req.param("category");
	const data = (await got_default({
		method: "get",
		url
	})).data;
	const $ = load(data);
	const list = $("main div div section");
	return {
		title: $("head title").text(),
		link: url,
		item: list.toArray().map((item) => {
			item = $(item);
			const pubDate = parseDate(item.find("time").attr("datetime"));
			return {
				title: item.find("h2 a").text(),
				link: item.find("h2 a").attr("href"),
				pubDate,
				description: item.find("p").text()
			};
		})
	};
}
//#endregion
export { route };
