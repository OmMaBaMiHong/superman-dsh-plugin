import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-YP52tWGY.mjs";
import { load } from "cheerio";
//#region lib/routes/pts/projects.ts
const route = {
	path: "/projects",
	categories: ["traditional-media"],
	example: "/pts/projects",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["news.pts.org.tw/projects", "news.pts.org.tw/"] }],
	name: "數位敘事",
	maintainers: ["nczitzk"],
	handler,
	url: "news.pts.org.tw/projects"
};
async function handler() {
	const currentUrl = `https://news.pts.org.tw/projects`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const items = $("h3 a").toArray().map((item) => {
		item = $(item);
		const projectDiv = item.parent().parent();
		const description = projectDiv.find("p").text();
		return {
			title: item.text(),
			link: item.attr("href"),
			pubDate: parseDate(projectDiv.find("time").text()),
			description: renderDescription({
				image: projectDiv.parent().find(".cover-fit")?.attr("src") ?? projectDiv.parent().parent().find(".cover-fit").attr("src"),
				description: description ? `<p>${description}</p>` : ""
			})
		};
	});
	return {
		title: $("title").text().replace(/第\d+頁 ｜ /, ""),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
