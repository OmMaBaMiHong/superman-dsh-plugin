import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/gamekee/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/gamekee/news",
	radar: [{
		source: ["gamekee.com", "gamekee.com/news"],
		target: "/news"
	}],
	name: "游戏情报",
	maintainers: ["ueiu"],
	handler,
	url: "gamekee.com/news"
};
async function handler() {
	const rootUrl = "https://www.gamekee.com";
	const { data } = await rofetch(`${rootUrl}/v1/index/newsList`, {
		headers: {
			"game-alias": "www",
			"device-num": "1",
			"User-Agent": config.ua
		},
		query: {
			page_no: 1,
			limit: 20
		}
	});
	const list = data.map((item) => {
		return {
			link: new URL(`${item.id}.html`, rootUrl).href,
			title: item.title,
			pubDate: parseDate(item.created_at, "X")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))("div.content").html();
		return item;
	})));
	return {
		link: `${rootUrl}/news`,
		title: "游戏情报|Gamekee",
		item: items
	};
}
//#endregion
export { route };
