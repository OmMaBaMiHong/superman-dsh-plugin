import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/pudong/zwgk.ts
const route = {
	path: "/zwgk",
	categories: ["government"],
	example: "/gov/pudong/zwgk",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.pudong.gov.cn/zwgk/zxxxgk/index.html"],
		target: "/zwgk"
	}],
	name: "政务公开",
	maintainers: ["himingway"],
	handler
};
async function handler() {
	const list = (await rofetch("https://www.pudong.gov.cn/zwgk-search-front/api/data/affair", {
		method: "POST",
		body: {
			channelList: ["5144"],
			pageSize: 20
		}
	})).data.list.map((item) => ({
		title: item.title,
		link: item.url,
		pubDate: parseDate(item.display_date)
	}));
	return {
		title: "信息公开_政务公开-上海市浦东新区门户网站",
		link: "https://www.pudong.gov.cn/zwgk/zxxxgk/index.html",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load(await rofetch(item.link))("#ivs_content").first().html();
			return item;
		})))
	};
}
//#endregion
export { route };
