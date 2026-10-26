import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/agora0/pen0.ts
const route = {
	path: "/pen0",
	categories: ["new-media"],
	example: "/agora0/pen0",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["agorahub.github.io/pen0"] }],
	name: "共和報",
	maintainers: ["TonyRL"],
	handler,
	url: "agorahub.github.io/pen0"
};
async function handler() {
	const response = await got_default(`https://agorahub.github.io/pen0/`);
	const $ = load(response.data);
	const list = $("div article").toArray().slice(0, -1).map((item) => {
		item = $(item);
		const meta = item.find("h5").first().text();
		return {
			title: item.find("h3").text(),
			link: item.find("h3 a").attr("href"),
			author: meta.split("|", 1)[0].trim(),
			pubDate: parseDate(meta.split("|", 2)[1].trim())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default(item.link)).data);
		$("h1").remove();
		item.description = $("article").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		description: $("head meta[name=\"description\"]").attr("content"),
		link: response.url,
		image: $("link[rel=\"apple-touch-icon\"]").attr("href"),
		item: items
	};
}
//#endregion
export { route };
