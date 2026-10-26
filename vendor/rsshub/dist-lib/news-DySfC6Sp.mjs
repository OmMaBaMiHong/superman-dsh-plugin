import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/bbcnewslabs/news.ts
const route = {
	path: "/news",
	categories: ["programming"],
	example: "/bbcnewslabs/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bbcnewslabs.co.uk/"] }],
	name: "News",
	maintainers: ["elxy"],
	handler,
	url: "bbcnewslabs.co.uk/"
};
async function handler() {
	const rootUrl = "https://bbcnewslabs.co.uk";
	const $ = load((await got_default({
		method: "get",
		url: `${rootUrl}/news`
	})).data);
	return {
		title: "News - BBC News Labs",
		link: rootUrl,
		item: $("a[href^=\"/news/20\"]").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find("h3[class^=\"thumbnail-module--thumbnailTitle--\"]").text(),
				description: item.find("span[class^=\"thumbnail-module--thumbnailDescription--\"]").text(),
				pubDate: parseDate(item.find("span[class^=\"thumbnail-module--thumbnailType--\"]").text()),
				link: rootUrl + item.attr("href")
			};
		})
	};
}
//#endregion
export { route };
