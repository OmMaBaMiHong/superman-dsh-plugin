import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as namespace } from "./namespace-CuHoQMDK.mjs";
import { load } from "cheerio";
//#region lib/routes/sdmuseum/news.ts
const route = {
	path: "/news",
	categories: ["travel"],
	example: "/sdmuseum/news",
	parameters: {},
	name: "News",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.sdmuseum.com/col/col270324/index.html"],
		target: "/news"
	}],
	handler: async () => {
		const baseUrl = "https://www.sdmuseum.com";
		const apiUrl = `${baseUrl}/col/col270324/index.html`;
		const museumName = namespace.zh?.name || namespace.name;
		const $ = load((await got_default({
			method: "get",
			url: apiUrl
		})).data, { xml: true });
		const items = $("record").toArray().map((el) => {
			const $item = load($(el).text());
			const $a = $item(".ltit a");
			return {
				title: $a.attr("title"),
				link: new URL($a.attr("href"), baseUrl).href,
				pubDate: parseDate($item(".data.av").text().trim())
			};
		});
		return {
			title: `${museumName} - 公告`,
			link: apiUrl,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
