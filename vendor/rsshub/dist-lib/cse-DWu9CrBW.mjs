import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/csu/cse.ts
async function fetch(address) {
	return {
		description: load((await got_default(address)).data)("[name=\"_newscontent_fromname\"]").html(),
		link: address,
		guid: address
	};
}
const route = {
	path: "/cse/:type?",
	categories: ["university"],
	example: "/csu/cse",
	parameters: { type: "类型" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "计算机学院",
	maintainers: ["j1g5awi"],
	handler,
	description: `| 类型 | 学院新闻 | 通知公告 | 学术信息 | 学工动态 | 科研动态 |
| ---- | -------- | -------- | -------- | -------- | -------- |
| 参数 | xyxw     | tzgg     | xsxx     | xgdt     | kydt     |`
};
async function handler(ctx) {
	const url = "https://cse.csu.edu.cn/index/";
	const link = url + (ctx.req.param("type") ?? "tzgg") + ".htm";
	const $ = load((await got_default.get(link)).data);
	const list = $(".download li").toArray();
	const out = await Promise.all(list.map((item) => {
		const $ = load(item);
		const address = new URL($("a").attr("href"), url).href;
		const title = $("a").text();
		const pubDate = $("span").text();
		return cache_default.tryGet(address, async () => {
			const single = await fetch(address);
			single.title = title;
			single.pubDate = parseDate(pubDate, "YYYY/MM/DD");
			return single;
		});
	}));
	return {
		title: $("title").text(),
		link,
		item: out
	};
}
//#endregion
export { route };
