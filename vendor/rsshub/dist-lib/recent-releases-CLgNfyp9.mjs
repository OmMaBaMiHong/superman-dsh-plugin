import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gogoanimehd/recent-releases.ts
const route = {
	path: "/recent-releases",
	categories: ["anime"],
	example: "/gogoanimehd/recent-releases",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["developer.anitaku.to/"] }],
	name: "Recent Releases",
	maintainers: ["user4302"],
	handler,
	url: "developer.anitaku.to/"
};
async function handler() {
	const rootUrl = "https://anitaku.to/home.html";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const arrayOfItems = $($(".last_episodes")).find("li").toArray().map((item) => {
		const title = $(item).find(".name a").attr("title");
		const episode = $(item).find(".episode").text();
		const link = $(item).find(".name a").attr("href");
		return {
			title,
			description: `<h2>${episode}</h2><br/><img src='${$(item).find(".img a img").attr("src")}' alt='${title}'>`,
			link
		};
	});
	return {
		title: $("title").text(),
		link: rootUrl,
		item: arrayOfItems
	};
}
//#endregion
export { route };
