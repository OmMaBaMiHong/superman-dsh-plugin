import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parseToken } from "./cookies-CBhJvxcZ.mjs";
import { load } from "cheerio";
//#region lib/routes/xueqiu/today.ts
const route = {
	path: "/today",
	categories: ["finance"],
	example: "/xueqiu/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xueqiu.com/today"] }],
	name: "今日话题",
	maintainers: ["nczitzk"],
	handler,
	url: "xueqiu.com/today"
};
async function handler(ctx) {
	const size = ctx.req.query("limit") ?? "20";
	const rootUrl = "https://xueqiu.com";
	const currentUrl = `${rootUrl}/today`;
	const apiUrl = `${rootUrl}/statuses/hot/listV2.json?since_id=-1&size=${size}`;
	const token = await parseToken(currentUrl);
	let items = (await got_default({
		method: "get",
		url: apiUrl,
		headers: {
			Referer: rootUrl,
			Cookie: token
		}
	})).data.items.map((item) => {
		item = item.original_status;
		return {
			title: item.title || item.rawTitle || item.description.replaceAll(/<(.*?)>/g, ""),
			link: `${rootUrl}${item.target}`,
			pubDate: parseDate(item.created_at),
			author: item.user.screen_name
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default({
			method: "get",
			url: item.link,
			headers: {
				Referer: rootUrl,
				Cookie: token
			}
		})).data)(".article__bd__detail").html();
		return item;
	})));
	return {
		title: "今日话题 - 雪球",
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
