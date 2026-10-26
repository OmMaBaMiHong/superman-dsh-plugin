import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as baseUrl } from "./utils-DK8zmVwb.mjs";
import { load } from "cheerio";
//#region lib/routes/agirls/topic-list.ts
const route = {
	path: "/topic_list",
	categories: ["new-media"],
	example: "/agirls/topic_list",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["agirls.aotter.net/", "agirls.aotter.net/topic"] }],
	name: "当前精选主题列表",
	maintainers: ["TonyRL"],
	handler,
	url: "agirls.aotter.net/"
};
async function handler() {
	const category = "topic";
	const link = `${baseUrl}/${category}`;
	const $ = load((await got_default(`${baseUrl}/${category}`)).data);
	const items = $(".ag-topic").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".ag-topic__link").text().trim(),
			description: item.find(".ag-topic__summery").text().trim(),
			link: `${baseUrl}${item.find(".ag-topic__link").attr("href")}`
		};
	});
	return {
		title: $("head title").text().trim(),
		link,
		description: $("head meta[name=description]").attr("content"),
		item: items,
		language: $("html").attr("lang")
	};
}
//#endregion
export { route };
