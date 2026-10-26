import { t as got_default } from "./got-Dnzt41dd.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/blogread/index.ts
const route = {
	path: "/newest",
	categories: ["programming"],
	example: "/blogread/newest",
	radar: [{ source: ["blogread.cn/news/newest.php"] }],
	name: "最新文章",
	maintainers: ["fashioncj"],
	handler
};
async function handler() {
	const url = "https://blogread.cn/news/newest.php";
	const response = await got_default({
		method: "get",
		url
	});
	const $ = cheerio.load(response.data);
	return {
		title: "技术头条",
		link: url,
		item: $(".media").toArray().map((elem) => {
			elem = $(elem);
			const $link = elem.find("dt a");
			return {
				title: $link.text(),
				description: elem.find("dd").eq(0).text(),
				link: $link.attr("href"),
				author: elem.find(".small a").eq(0).text(),
				pubDate: elem.find("dd").eq(1).text().split("\n", 3)[2]
			};
		})
	};
}
//#endregion
export { route };
