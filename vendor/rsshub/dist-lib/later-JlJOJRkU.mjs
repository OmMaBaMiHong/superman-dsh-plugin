import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/douban/other/later.ts
const route = {
	path: "/movie/later",
	categories: ["social-media"],
	example: "/douban/movie/later",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "即将上映的电影",
	maintainers: ["DIYgod"],
	handler
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: "https://movie.douban.com/cinema/later/beijing/"
	})).data);
	return {
		title: "即将上映的电影",
		link: "https://movie.douban.com/cinema/later/",
		item: $("#showing-soon .item").toArray().map((ele) => {
			const description = $(ele).html();
			const name = $("h3", ele).text().trim();
			const date = $("ul li", ele).eq(0).text().trim();
			const type = $("ul li", ele).eq(1).text().trim();
			const link = $("a.thumb", ele).attr("href");
			return {
				title: `${date} - 《${name}》 - ${type}`,
				link,
				description
			};
		})
	};
}
//#endregion
export { route };
