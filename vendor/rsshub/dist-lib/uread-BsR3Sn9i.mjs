import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wechat/uread.ts
const route = {
	path: "/uread/:userid",
	categories: ["new-media"],
	example: "/wechat/uread/shensing",
	parameters: { userid: "公众号的微信号, 可在 微信-公众号-更多资料 中找到。并不是所有的都支持，能不能用随缘" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "公众号（优读来源）",
	maintainers: ["kt286"],
	handler
};
async function handler(ctx) {
	const userid = ctx.req.param("userid");
	const data = (await got_default({
		method: "get",
		url: `http://119.29.146.143:8080/reading/subscription/account/recent?uid=${userid}`
	})).data;
	const ProcessFeed = (data) => {
		return load(data)(".rich_media_content").html();
	};
	const items = await Promise.all(data.data.map(async (item) => {
		const link = item.url;
		const cacheIn = await cache_default.get(link);
		if (cacheIn) return JSON.parse(cacheIn);
		const response = await got_default({
			method: "get",
			url: link
		});
		const description = ProcessFeed(response.data);
		const single = {
			title: item.title,
			description,
			link,
			author: item.official_account,
			pubDate: item.publish_time
		};
		cache_default.set(link, JSON.stringify(single));
		return single;
	}));
	return {
		title: `优读 - ${userid}`,
		link: "https://uread.ai/",
		item: items
	};
}
//#endregion
export { route };
