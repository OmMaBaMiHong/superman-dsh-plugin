import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/chaping/news.ts
const titles = {
	0: "全部",
	15: "直播",
	3: "科技新鲜事",
	7: "互联网槽点",
	5: "趣味科技",
	6: "DEBUG TIME",
	1: "游戏",
	8: "视频",
	9: "公里每小时"
};
const route = {
	path: "/news/:caty?",
	categories: ["new-media"],
	example: "/chaping/news/15",
	parameters: { caty: "分类，默认为全部资讯" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "资讯",
	maintainers: ["nczitzk"],
	handler,
	description: `| 编号 | 分类       |
| ---- | ---------- |
| 15   | 直播       |
| 3    | 科技新鲜事 |
| 7    | 互联网槽点 |
| 5    | 趣味科技   |
| 6    | DEBUG TIME |
| 1    | 游戏       |
| 8    | 视频       |
| 9    | 公里每小时 |`
};
async function handler(ctx) {
	const caty = ctx.req.param("caty") ?? "";
	const targetUrl = `https://chaping.cn/news?cate=${caty}`;
	const list = (await got_default({
		method: "get",
		url: `https://chaping.cn/api/official/information/news?page=1&limit=16&cate=${caty}`
	})).data.data.map((item) => ({
		title: item.title,
		link: `https://chaping.cn/news/${item.id}`,
		pubDate: parseDate(item.time_publish_timestamp * 1e3)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		item.description = JSON.parse(detailResponse.data.match(/"current":(.*?),"optionsList":/)[1]).content;
		return item;
	})));
	return {
		title: `差评资讯 - ${titles[ctx.req.param("caty") === "" ? 0 : ctx.req.param("caty")]}`,
		link: targetUrl,
		item: items
	};
}
//#endregion
export { route };
