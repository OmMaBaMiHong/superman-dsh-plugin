import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/wmpvp/index.ts
const route = {
	path: "/news/:type",
	categories: ["game"],
	example: "/wmpvp/news/1",
	parameters: { type: "资讯分类，见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "资讯列表",
	maintainers: ["tssujt"],
	handler,
	description: `| DOTA2 | CS2 |
| ----- | --- |
| 1     | 2   |`
};
const TYPE_MAP = {
	"1": "DOTA2",
	"2": "CS2"
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const data = (await got_default({
		method: "get",
		url: `https://appengine.wmpvp.com/steamcn/community/homepage/getHomeInformation?gameTypeStr=${type}&pageNum=1&pageSize=20`
	})).data.result.filter((item) => item.news !== void 0);
	const items = await Promise.all(data.map((item) => {
		const entity = item.news;
		const newsId = entity.newsId;
		const newsLink = `https://news.wmpvp.com/news.html?id=${newsId}&gameTypeStr=${type}`;
		return cache_default.tryGet(newsLink, async () => {
			const detailResponse = await got_default({
				method: "get",
				url: `https://appactivity.wmpvp.com/steamcn/app/news/getAppNewsById?gameType=${type}&newsId=${newsId}`
			});
			return {
				title: entity.title,
				pubDate: parseDate(entity.publishTime),
				link: newsLink,
				guid: newsLink,
				author: entity.author,
				description: detailResponse.data.result.news.content
			};
		});
	}));
	return {
		title: `完美世界电竞 - ${TYPE_MAP[type]} 资讯`,
		link: "https://news.wmpvp.com/",
		item: items
	};
}
//#endregion
export { route };
