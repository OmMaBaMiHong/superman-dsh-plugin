import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-DeMTu6W2.mjs";
//#region lib/routes/dongqiudi/top-news.ts
const route = {
	path: "/top_news/:id?",
	categories: ["sport"],
	example: "/dongqiudi/top_news/1",
	parameters: { id: "类别 id，不填默认头条新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["m.dongqiudi.com/home/:id"],
		target: "/top_news/:id"
	}],
	name: "新闻",
	maintainers: ["HendricksZheng"],
	handler,
	description: `| 头条 | 深度 | 闲情 | D 站 | 中超 | 国际 | 英超 | 西甲 | 意甲 | 德甲 |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| 1    | 55   | 37   | 219  | 56   | 120  | 3    | 5    | 4    | 6    |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? 1;
	const { data } = await got_default(`https://api.dongqiudi.com/app/tabs/web/${id}.json`);
	const articles = data.articles;
	const label = data.label;
	const list = articles.map((item) => ({
		title: item.title,
		link: `https://www.dongqiudi.com/articles/${item.id}.html`,
		category: [item.category, ...item.secondary_category ?? []],
		pubDate: parseDate(item.show_time)
	}));
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		utils_default.ProcessFeedType2(item, response);
		return item;
	})));
	return {
		title: `懂球帝 - ${label}`,
		link: `https://www.dongqiudi.com/articlesList/${id}`,
		item: out.filter((e) => e !== void 0)
	};
}
//#endregion
export { route };
