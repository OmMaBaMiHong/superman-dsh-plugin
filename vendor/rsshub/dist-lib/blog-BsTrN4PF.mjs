import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cmu/andypavlo/blog.ts
async function getArticles() {
	const { data: res } = await got_default("https://www.cs.cmu.edu/~pavlo/blog/index.html");
	const $ = load(res);
	return $(".row.mb-3").toArray().map((element) => {
		const $item = $(element);
		const $title = $item.find("h4 a");
		const $date = $item.find(".text-muted");
		const $description = $item.find("p");
		return {
			title: $title.text().trim(),
			link: $title.attr("href"),
			description: $description.text().trim(),
			pubDate: parseDate($date.attr("title")),
			guid: $title.attr("href")
		};
	});
}
const route = {
	path: "/andypavlo/blog",
	categories: ["blog"],
	example: "/cmu/andypavlo/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Andy Pavlo Blog",
	maintainers: ["mocusez"],
	handler
};
async function handler() {
	return {
		title: "Andy Pavlo - Carnegie Mellon University",
		link: "https://www.cs.cmu.edu/~pavlo/blog/index.html",
		item: await getArticles()
	};
}
//#endregion
export { route };
