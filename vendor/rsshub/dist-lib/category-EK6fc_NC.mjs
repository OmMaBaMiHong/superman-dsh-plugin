import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/secrss/category.ts
const route = {
	path: "/category/:category?",
	categories: ["programming"],
	example: "/secrss/category/产业趋势",
	parameters: { category: "N" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["XinRoom", "SunBK201"],
	handler
};
async function handler(ctx) {
	const api = "https://www.secrss.com/api/articles?tag=";
	const { category = "" } = ctx.req.param();
	const host = "https://www.secrss.com";
	const dataArray = (await got_default(`${api}${category}`)).data.data;
	const items = await Promise.all(dataArray.map((item) => {
		const itemUrl = `${host}/articles/${item.id}`;
		return cache_default.tryGet(itemUrl, async () => {
			const description = load((await got_default(itemUrl)).data)(".article-body").html().trim();
			return {
				title: item.title,
				link: itemUrl,
				pubDate: timezone(parseDate(item.published_at), 8),
				description,
				author: item.source_author,
				category: item.tags.map((t) => t.title)
			};
		});
	}));
	return {
		title: `安全内参-${category}`,
		link: "https://www.secrss.com",
		item: items
	};
}
//#endregion
export { route };
