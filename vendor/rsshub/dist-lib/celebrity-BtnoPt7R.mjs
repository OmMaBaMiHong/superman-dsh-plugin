import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/douban/other/celebrity.ts
const route = {
	path: "/celebrity/:id/:sort?",
	categories: ["social-media"],
	example: "/douban/celebrity/1274261",
	parameters: {
		id: "电影人 id",
		sort: "排序方式，缺省为 `time`（时间排序），可为 `vote` （评价排序）"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "豆瓣电影人",
	maintainers: ["minimalistrojan"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const sort = ctx.req.param("sort") || "time";
	const data = (await got_default({
		method: "get",
		url: `https://movie.douban.com/celebrity/${id}/movies?sortby=${sort}`
	})).data;
	const $ = load(data);
	const list = $("div.grid_view > ul li");
	const person = $("#content > h1").text().replace(/的全部作品（\d+）/, "");
	let itemPicUrl;
	return {
		title: `豆瓣电影人 - ${person}`,
		link: `https://movie.douban.com/celebrity/${id}/movies?sortby=${sort}`,
		item: list.toArray().map((item) => {
			item = $(item);
			itemPicUrl = item.find("img").attr("src");
			return {
				title: "《" + item.find("h6 > a").text() + "》" + item.find("h6 > span").text().replace("(", "（").replace(")", "）").replaceAll("[", "【").replaceAll("]", "】"),
				description: `<img src="${itemPicUrl}"/><br/>主演：${item.find("dl > dd").last().text()}<br/>评分：${item.find(".star > span:nth-child(2)").text()}`,
				link: item.find("dt > a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
