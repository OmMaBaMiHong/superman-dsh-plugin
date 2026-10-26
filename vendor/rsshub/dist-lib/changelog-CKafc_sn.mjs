import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/typora/changelog.ts
const route = {
	path: "/changelog",
	categories: ["program-update"],
	example: "/typora/changelog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["support.typora.io/"] }],
	name: "Changelog",
	maintainers: ["cnzgray"],
	handler,
	url: "support.typora.io/"
};
async function handler() {
	const host = "https://support.typora.io";
	const { data } = await got_default(`${host}/store/`);
	const list = Object.values(data).filter((i) => i.category === "new").map((i) => ({
		title: i.title,
		author: i.author,
		description: i.content,
		link: `${host}${i.url}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(item.link);
		const $ = load(data);
		item.pubDate = parseDate($(".post-meta time").text());
		item.description = $("#post-content").html();
		return item;
	})));
	return {
		title: "Typora Changelog",
		link: host,
		description: "Typora Changelog",
		image: `${host}/assets/img/favicon-128.png`,
		item: items
	};
}
//#endregion
export { route };
