import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/xboxfan/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/xboxfan/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xboxfan.com/"] }],
	name: "资讯",
	maintainers: ["XXY233"],
	handler,
	url: "xboxfan.com/"
};
async function handler() {
	const { data: response } = await got_default("https://xboxfan.com/");
	const $ = load(response);
	$("div.homeCom").remove();
	$("div.homeMore").remove();
	$("el-image").each((index, el_image) => {
		const img = $("<img>");
		img.attr("src", $(el_image).attr("src"));
		$(el_image).replaceWith(img);
	});
	return {
		title: "盒心光环·资讯",
		link: "https://xboxfan.com/",
		item: $(`div.homeItem[v-if="showFeedLevel == 'read'"]`).toArray().map((item) => {
			const data = {
				title: "资讯",
				author: $(item).find("div.homeName").text(),
				pubDate: parseRelativeDate($(item).find("div.homeTime").first().text().split(" ", 1)[0])
			};
			$(item).find("div.homeName").remove();
			$(item).find("div.homeTime").remove();
			data.guid = md5($(item).text());
			data.description = $(item).html();
			return data;
		})
	};
}
//#endregion
export { route };
