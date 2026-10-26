import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/secrss/author.ts
const route = {
	path: "/author/:author",
	categories: ["programming"],
	example: "/secrss/author/网络安全威胁和漏洞信息共享平台",
	parameters: { author: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "作者",
	maintainers: ["XinRoom", "SunBK201"],
	handler
};
async function handler(ctx) {
	const api = "https://www.secrss.com/api/articles/group?author=";
	const author = ctx.req.param("author");
	const host = "https://www.secrss.com";
	const dataArray = (await got_default(`${api}${author}`)).data.data.list;
	const items = await Promise.all(dataArray.map((item) => {
		const itemUrl = `${host}${item.url}`;
		return cache_default.tryGet(itemUrl, async () => {
			const description = load((await got_default(itemUrl)).data)(".article-body").html().trim();
			return {
				title: item.title,
				link: itemUrl,
				pubDate: parseDate(item.original_timestamp, "X"),
				description,
				category: item.tag
			};
		});
	}));
	return {
		title: `安全内参-${author}`,
		link: "https://www.secrss.com",
		item: items
	};
}
//#endregion
export { route };
