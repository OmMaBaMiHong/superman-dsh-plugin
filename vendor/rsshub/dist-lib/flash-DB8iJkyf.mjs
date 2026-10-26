import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/egsea/flash.ts
const route = {
	path: "/flash",
	categories: ["new-media"],
	example: "/egsea/flash",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["egsea.com/news/flash"] }],
	name: "快讯",
	maintainers: ["hillerliao"],
	handler,
	url: "egsea.com/news/flash"
};
async function handler() {
	return {
		title: "快讯 - e 公司",
		link: "https://www.egsea.com/news/flash",
		item: (await got_default({
			method: "get",
			url: "https://www.egsea.com/news/flash-list?per-page=30"
		})).data.data.map((item) => {
			const pubDate = parseDate(item.pageTime, "X");
			const link = item.url;
			return {
				title: item.title,
				link,
				pubDate,
				description: item.content,
				category: item.tags?.map((tag) => tag.name)
			};
		})
	};
}
//#endregion
export { route };
