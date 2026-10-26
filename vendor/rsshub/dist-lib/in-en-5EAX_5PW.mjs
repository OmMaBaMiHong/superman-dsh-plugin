import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/in-en/index.ts
const CATEGORIES = {
	solar: {
		name: "光伏太阳能",
		newsPath: "/news/"
	},
	wind: {
		name: "风电",
		newsPath: "/windnews/"
	},
	chuneng: {
		name: "储能",
		newsPath: "/news/"
	},
	h2: {
		name: "氢能",
		newsPath: "/hydrogen/"
	},
	chd: {
		name: "充换电",
		newsPath: "/ChargingStation/"
	},
	newenergy: {
		name: "新能源",
		newsPath: "/news/"
	},
	power: {
		name: "电力",
		newsPath: "/news/"
	},
	huanbao: {
		name: "环保",
		newsPath: "/policy/"
	}
};
const route = {
	path: "/news/:type",
	categories: ["new-media"],
	example: "/in-en/news/solar",
	parameters: { type: "Channel type, see table below" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新闻",
	maintainers: ["Harviewang"],
	description: `| 频道       | type 参数 |
| ---------- | --------- |
| 光伏太阳能 | solar     |
| 风电       | wind      |
| 储能       | chuneng   |
| 氢能       | h2        |
| 充换电     | chd       |
| 新能源综合 | newenergy |
| 电力       | power     |
| 环保       | huanbao   |`,
	async handler(ctx) {
		const type = ctx.req.param("type");
		const cat = CATEGORIES[type];
		if (!cat) throw new Error(`Unknown channel type: ${type}. Valid values: ${Object.keys(CATEGORIES).join(", ")}`);
		const listUrl = `${`https://${type}.in-en.com`}${cat.newsPath}`;
		const $ = load(await rofetch(listUrl));
		const list = $("ul.infoList > li").toArray().map((el) => {
			const $el = $(el);
			const $a = $el.find(".listTxt h5 a");
			const link = $a.attr("href") ?? "";
			const title = $a.attr("title")?.trim() || $a.text().trim();
			const pubDateRaw = $el.find(".listTxt .prompt > i").text().trim();
			return {
				title,
				link,
				author: $el.find(".listTxt .prompt > span").first().text().replace("来源：", "").trim(),
				category: $el.find(".listTxt .prompt > span:not(:first-of-type) em a").toArray().map((a) => $(a).text().trim()).filter(Boolean),
				pubDate: pubDateRaw ? parseRelativeDate(pubDateRaw) : void 0
			};
		}).filter((item) => item.title && item.link);
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $d = load(await rofetch(item.link));
			item.description = $d("#article").html() ?? void 0;
			const detailAuthor = $d("p.source a").text().trim();
			if (detailAuthor) item.author = detailAuthor;
			return item;
		})));
		return {
			title: `国际能源网 · ${cat.name}`,
			link: listUrl,
			item: items
		};
	}
};
//#endregion
export { route };
