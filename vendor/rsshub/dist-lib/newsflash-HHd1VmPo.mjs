import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/chaping/newsflash.ts
const host = "https://chaping.cn";
const route = {
	path: "/newsflash",
	categories: ["new-media"],
	example: "/chaping/newsflash",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["chaping.cn/newsflash"] }],
	name: "快讯",
	maintainers: ["Fatpandac"],
	handler,
	url: "chaping.cn/newsflash"
};
async function handler() {
	const data = (await rofetch(`${host}/api/official/information/newsflash?page=1&limit=21`)).data;
	return {
		title: "差评 快讯",
		link: `${host}/newsflash`,
		item: data && data.map((item) => ({
			title: item.title,
			description: item.summary,
			pubDate: parseDate(item.time_publish_timestamp * 1e3),
			link: item.origin_url
		}))
	};
}
//#endregion
export { route };
