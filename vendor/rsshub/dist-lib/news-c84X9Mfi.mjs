import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-BrS5E3W7.mjs";
//#region lib/routes/nintendo/news.ts
const route = {
	path: "/news",
	categories: ["game"],
	example: "/nintendo/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nintendo.com.hk/topics", "nintendo.com.hk/"] }],
	name: "News（Hong Kong only）",
	maintainers: ["HFO4"],
	handler,
	url: "nintendo.com.hk/topics"
};
async function handler(ctx) {
	const data = (await got_default("https://www.nintendo.com.hk/data/json/topics.json")).data.filter((val) => val.only_for !== "tw" && val.url.startsWith("/topics/article/")).slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30);
	return {
		title: "Nintendo（香港）主页资讯",
		link: "https://www.nintendo.com.hk/topics/",
		description: "Nintendo 香港有限公司官网刊登的资讯",
		item: (await utils_default.ProcessNews(data, cache_default)).map((item) => ({
			title: item.title,
			description: item.content,
			link: `https://www.nintendo.com.hk${item.url}`,
			pubDate: parseDate(item.release_date, "YYYY.M.D")
		}))
	};
}
//#endregion
export { route };
