import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/seu/cse/index.ts
const route = {
	path: "/cse/:type?",
	categories: ["university"],
	example: "/seu/cse/xyxw",
	parameters: { type: "分类名，默认为 `xyxw`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cse.seu.edu.cn/:type/list.htm", "cse.seu.edu.cn/"] }],
	name: "计算机技术与工程学院",
	maintainers: ["LogicJake"],
	handler,
	description: `| 学院新闻 | 通知公告 | 教务信息 | 就业信息 | 学工事务 |
| -------- | -------- | -------- | -------- | -------- |
| xyxw     | tzgg     | jwxx     | jyxx     | xgsw     |`
};
async function handler(ctx) {
	const host = "https://cse.seu.edu.cn";
	const map = {
		22535: { initial: "xyxw" },
		22536: { initial: "tzgg" },
		22538: { initial: "jwxx" },
		22537: { initial: "jyxx" },
		22539: { initial: "xgsw" }
	};
	const { type = 22535 } = ctx.req.param();
	const id = type.length === 4 ? Object.keys(map).find((key) => map[key].initial === type) : Number.parseInt(type);
	const link = new URL(`${id}/list.htm`, host).href;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".news_list .news").toArray().map((e) => {
		e = $(e);
		const a = e.find(".news_title a");
		return {
			title: a.attr("title"),
			link: new URL(a.attr("href"), host).href,
			pubDate: parseDate(e.find(".news_meta").text())
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let response;
		try {
			response = await got_default(item.link);
		} catch (error) {
			if (error.response.url.startsWith("https://newids.seu.edu.cn/")) return item;
			throw error;
		}
		item.description = load(response.data)("div.wp_articlecontent").html();
		return item;
	})));
	return {
		link,
		title: `${$("meta[name=keywords]").attr("content")}${$("meta[name=description]").attr("content")} -- ${$("head title").text()}`,
		description: "东南大学计算机技术与工程学院RSS",
		item: out
	};
}
//#endregion
export { route };
