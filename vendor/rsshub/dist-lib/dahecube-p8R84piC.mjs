import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/dahecube/utils.ts
const TYPE$1 = {
	recommend: {
		name: "推荐",
		id: 1
	},
	history: {
		name: "党史",
		id: 37
	},
	stock: {
		name: "豫股",
		id: 2
	},
	business: {
		name: "财经",
		id: 4
	},
	education: {
		name: "投教",
		id: 36
	},
	finance: {
		name: "金融",
		id: 5
	},
	science: {
		name: "科创",
		id: 19
	},
	invest: {
		name: "投融",
		id: 29
	},
	column: {
		name: "专栏",
		id: 33
	}
};
function parseUrl$1(type) {
	return type === "recommend" ? "https://www.dahecube.com/index.html?recid=1" : `https://www.dahecube.com/channel.html?recid=${TYPE$1[type].id}`;
}
//#endregion
//#region lib/routes/dahecube/index.ts
const { TYPE, parseUrl } = {
	TYPE: TYPE$1,
	parseUrl: parseUrl$1
};
const route = {
	path: "/:type?",
	categories: ["new-media"],
	example: "/dahecube",
	parameters: { type: "板块，见下表，默认为推荐" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["linbuxiao"],
	handler,
	description: `| 推荐      | 党史    | 豫股  | 财经     | 投教      | 金融    | 科创    | 投融   | 专栏   |
| --------- | ------- | ----- | -------- | --------- | ------- | ------- | ------ | ------ |
| recommend | history | stock | business | education | finance | science | invest | column |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "recommend";
	const list = (await got_default({
		method: "post",
		url: "https://app.dahecube.com/napi/news/pc/list",
		headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: JSON.stringify({
			channelid: TYPE[type].id,
			pno: 1,
			psize: 15
		})
	})).data.data.items.map((item) => ({
		title: item.title,
		pubDate: parseDate(item.pubtime, "YYYY-MM-DD HH:ss:mm"),
		author: item.source,
		id: item.recid
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.id, async () => {
		item.description = (await got_default({
			method: "post",
			url: "https://app.dahecube.com/napi/news/pc/artinfo",
			headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
			body: JSON.stringify({ artid: item.id })
		})).data.data.content;
		item.link = `https://www.dahecube.com/article.html?artid=${item.id}`;
		delete item.id;
		return item;
	})));
	const ret = {
		title: "大河财立方",
		link: parseUrl(type),
		description: `大河财立方 ${TYPE[type].name}`,
		language: "zh-cn",
		item: items
	};
	ctx.set("json", ret);
	return ret;
}
//#endregion
export { route };
