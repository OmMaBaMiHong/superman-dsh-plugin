import { t as config } from "./config-B5Cf_tHS.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/zhihu/hot.ts
const route = {
	path: "/hot/:category?",
	categories: ["social-media"],
	example: "/zhihu/hot",
	view: 0,
	features: {
		requireConfig: [{
			name: "ZHIHU_COOKIES",
			description: "",
			optional: true
		}],
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "知乎热榜",
	maintainers: [
		"nczitzk",
		"pseudoyu",
		"DIYgod"
	],
	handler
};
async function handler(ctx) {
	if (ctx.req.param("category")) {
		ctx.set("redirect", "/zhihu/hot");
		return null;
	}
	const cookie = config.zhihu.cookies;
	return {
		title: "知乎热榜",
		link: "https://www.zhihu.com/hot",
		item: (await got_default({
			method: "get",
			url: "https://api.zhihu.com/topstory/hot-lists/total?limit=10&reverse_order=0",
			headers: { Cookie: cookie }
		})).data.data.map((item) => {
			return {
				link: `https://www.zhihu.com/question/${item.target.url ? item.target.url.split("/").pop() : String(item.target.id)}`,
				title: item.target.title,
				pubDate: parseDate(item.target.created * 1e3),
				description: item.target.excerpt ? `<p>${item.target.excerpt}</p>` : ""
			};
		})
	};
}
//#endregion
export { route };
