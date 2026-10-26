import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/eastday/portrait.ts
const route = {
	path: "/portrait",
	categories: ["traditional-media"],
	example: "/eastday/portrait",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.eastday.com/"] }],
	name: "原创",
	maintainers: ["nczitzk"],
	handler,
	url: "www.eastday.com/"
};
async function handler() {
	const list = (await got_default({
		method: "post",
		url: `https://apin.eastday.com/api/news/Portrait`,
		json: {
			currentPage: 1,
			pageSize: 30
		}
	})).data.list.map((item) => ({
		link: item.url,
		title: item.title,
		pubDate: timezone(parseDate(item.time), 8)
	}));
	return {
		title: "原创 - 东方网",
		link: "https://www.eastday.com/eastday/shouye/07index/yc/index.html",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default({
				method: "get",
				url: item.link
			})).data)(".detail").html();
			return item;
		})))
	};
}
//#endregion
export { route };
