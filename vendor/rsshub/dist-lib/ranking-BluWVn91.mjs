import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/ithome/ranking.ts
const route = {
	path: "/ranking/:type",
	categories: ["new-media"],
	example: "/ithome/ranking/24h",
	parameters: { type: "类别" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "热榜",
	maintainers: ["immmortal", "luyuhuang"],
	handler,
	description: `| 24h           | 7days    | monthly |
| ------------- | -------- | ------- |
| 24 小时阅读榜 | 7 天最热 | 月榜    |`
};
async function handler(ctx) {
	const option = ctx.req.param("type");
	const $ = load((await got_default({
		method: "get",
		url: "https://www.ithome.com/block/rank.html"
	})).data);
	const config = {
		"24h": "24 小时最热",
		"7days": "7 天最热",
		monthly: "月榜"
	};
	const type2id = {
		"24h": "d-1",
		"7days": "d-2",
		monthly: "d-3"
	};
	const title = config[option];
	const id = type2id[option];
	if (!id) throw new InvalidParameterError("Bad type. See <a href=\"https://docs.rsshub.app/routes/new-media#it-zhi-jia\">https://docs.rsshub.app/routes/new-media#it-zhi-jia</a>");
	const list = $(`#${id} > li`).toArray().map((item) => {
		return {
			title: $(item).find("a").text(),
			link: $(item).find("a").attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const paragraph = content("#paragraph");
		paragraph.find("img[data-original]").each((_, ele) => {
			ele = $(ele);
			ele.attr("src", ele.attr("data-original"));
			ele.removeAttr("class");
			ele.removeAttr("data-original");
		});
		item.description = paragraph.html();
		item.pubDate = (/* @__PURE__ */ new Date(content("#pubtime_baidu").text() + " GMT+8")).toUTCString();
		return item;
	})));
	return {
		title: `IT之家-${title}`,
		link: "https://www.ithome.com",
		item: items
	};
}
//#endregion
export { route };
