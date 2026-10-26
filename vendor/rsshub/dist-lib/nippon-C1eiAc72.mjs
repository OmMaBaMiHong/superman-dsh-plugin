import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nippon/index.ts
const route = {
	path: "/:category?",
	categories: ["travel"],
	example: "/nippon/Politics",
	parameters: { category: "默认政治，可选如下" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.nippon.com/nippon/:category?", "www.nippon.com/cn"] }],
	name: "政治外交",
	description: `| 政治     | 经济    | 社会    | 展览预告 | 焦点专题           | 深度报道 | 话题         | 日本信息库 | 日本一蹩      | 人物访谈 | 编辑部通告    |
| -------- | ------- | ------- | -------- | ------------------ | -------- | ------------ | ---------- | ------------- | -------- | ------------- |
| Politics | Economy | Society | Culture  | Science,Technology | In-depth | japan-topics | japan-data | japan-glances | People   | Announcements |`,
	maintainers: ["laampui"],
	handler
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "Politics";
	const path = category === "Science,Technology" ? "condition4" : "category_code";
	const list = (await got_default.get(`https://www.nippon.com/api/search/cn/${path}/20/1/${category}?t=${Date.now()}`)).data.body.dataList.map((item) => ({
		title: item.title,
		link: `https://www.nippon.com/${item.pub_url}`,
		pubDate: item.pub_date
	}));
	const item = await Promise.all(list.slice(0, 10).map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default.get(item.link)).data)(".editArea").html();
		return item;
	})));
	return {
		title: `走进日本 - ${category}`,
		link: "https://www.nippon.com/cn/economy/",
		item
	};
}
//#endregion
export { route };
