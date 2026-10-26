import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sec-wiki/weekly.ts
const route = {
	path: "/weekly",
	categories: ["programming"],
	example: "/sec-wiki/weekly",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新周刊",
	maintainers: ["p7e4"],
	handler
};
async function handler() {
	const { data } = await got_default("https://www.sec-wiki.com/weekly/index");
	return {
		title: "SecWiki-安全维基",
		link: "https://www.sec-wiki.com/",
		item: data.matchAll(/\/weekly\/(\d+)">(.+?)<\/a><\/h5>\s*<p>(.+?)<\/p>/g).toArray().map((item) => ({
			title: item[2],
			link: `https://www.sec-wiki.com/weekly/${item[1]}`,
			description: item[3]
		}))
	};
}
//#endregion
export { route };
