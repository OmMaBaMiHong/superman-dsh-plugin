import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ymgal/article.ts
const host = "https://www.ymgal.games";
const types = {
	news: "?type=NEWS&page=1",
	column: "?type=COLUMN&page=1"
};
const route = {
	path: "/article/:type?",
	categories: ["anime"],
	example: "/ymgal/article",
	parameters: { type: "文章类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "文章",
	maintainers: ["SunBK201"],
	handler,
	description: `| 全部文章 | 资讯 | 专栏   |
| -------- | ---- | ------ |
| all      | news | column |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") || "all";
	const link = `${host}/co/topic/list` + types[type];
	let data = [];
	if (type === "all") {
		await Promise.all(Object.values(types).map(async (type) => {
			const response = await got_default(`${host}/co/topic/list${type}`);
			data.push(...response.data.data);
		}));
		data = data.toSorted((a, b) => b.publishTime - a.publishTime).slice(0, 10);
	} else data = (await got_default(link)).data.data;
	const items = await Promise.all(data.map((item) => {
		const itemUrl = "https://www.ymgal.games/co/article/" + item.topicId;
		return cache_default.tryGet(itemUrl, async () => {
			const description = load((await got_default(itemUrl)).data)("article").html().trim();
			return {
				title: item.title,
				link: itemUrl,
				pubDate: timezone(parseDate(item.publishTime), 8),
				description
			};
		});
	}));
	let info = "全部文章";
	if (type === "news") info = "资讯";
	else if (type === "column") info = "专栏";
	return {
		title: `月幕 Galgame - ${info}`,
		link: `${host}/co/article`,
		description: `月幕 Galgame - ${info}`,
		item: items
	};
}
//#endregion
export { route };
