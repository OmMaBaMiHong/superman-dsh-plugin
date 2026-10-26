import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/idolypride/news.ts
const route = {
	path: "/news",
	categories: ["anime"],
	view: 0,
	example: "/idolypride/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["idolypride.jp/news"] }],
	name: "News",
	maintainers: ["Mingxia1"],
	handler,
	url: "idolypride.jp/news"
};
async function handler() {
	return {
		title: "偶像荣耀-新闻",
		link: "https://idolypride.jp/news",
		item: (await got_default({
			method: "get",
			url: "https://idolypride.jp/wp-json/wp/v2/news"
		})).data.map((item) => {
			return {
				title: item.title.rendered,
				link: item.link,
				pubDate: timezone(parseDate(item.date_gmt), 0),
				description: item.content.rendered
			};
		})
	};
}
//#endregion
export { route };
