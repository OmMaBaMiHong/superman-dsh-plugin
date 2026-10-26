import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wizfile/index.ts
const rootUrl = "https://antibody-software.com";
const route = {
	path: "/updates",
	categories: ["program-update"],
	example: "/wizfile/updates",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["antibody-software.com/wizfile/download"] }],
	name: "Version History",
	maintainers: ["Fatpandac"],
	handler,
	url: "antibody-software.com/wizfile/download"
};
async function handler() {
	const currentUrl = `${rootUrl}/wizfile/download`;
	const $ = load((await got_default(currentUrl)).data);
	return {
		title: "WziFile - 更新日志",
		link: currentUrl,
		item: $("section.blog-section > div > div > div > h4").toArray().map((item) => {
			const title = $(item).text().replace(/\(.*?\)/, "");
			const pubDate = parseDate($(item).find("span").text().match(/\((.*?)\)/)[1]);
			return {
				title,
				description: $(item).next().html(),
				pubDate,
				guid: `${currentUrl}${title}`
			};
		})
	};
}
//#endregion
export { route };
