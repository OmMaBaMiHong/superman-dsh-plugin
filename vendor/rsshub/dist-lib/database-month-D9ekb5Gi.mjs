import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/aliyun/database-month.ts
const route = {
	path: "/database_month",
	categories: ["programming"],
	example: "/aliyun/database_month",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["mysql.taobao.org/monthly", "mysql.taobao.org/"] }],
	name: "数据库内核月报",
	maintainers: ["junbaor"],
	handler,
	url: "mysql.taobao.org/monthly"
};
async function handler() {
	const url = "http://mysql.taobao.org/monthly/";
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	const list = $("ul[class='posts'] > li").toArray().map((e) => {
		const element = $(e);
		return {
			title: element.find("a").text().trim(),
			description: "",
			link: `http://mysql.taobao.org${element.find("a").attr("href").trim()}/`
		};
	});
	const result = await Promise.all(list.map((item) => {
		const link = item.link;
		return cache_default.tryGet(link, async () => {
			item.description = load((await got_default(link)).data)(".content").html();
			return item;
		});
	}));
	return {
		title: $("title").text(),
		link: url,
		item: result.toReversed()
	};
}
//#endregion
export { route };
