import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/zju/cse/index.ts
const route = {
	path: "/cse/:category?",
	categories: ["university"],
	example: "/zju/cse/bksjy",
	parameters: { category: "类别：`bksjy`，默认为简讯专栏，详情在描述中" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "控制学院通知",
	maintainers: ["Rabbits-sys"],
	handler,
	description: `栏目类型

| 简讯专栏 | 本科生教育 | 研究生教育 | 科研学术 | 人事工作 | 学生思政 | 对外交流 | 就业指导 |
| -------- | ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| -        | bksjy      | yjsjy      | kyxs     | rsgz     | xssz     | dwjl     | jyzd     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const baseUrl = "http://www.cse.zju.edu.cn/";
	const categoryMap = {
		bksjy: {
			title: "本科生教育",
			tag: "39322"
		},
		yjsjy: {
			title: "研究生教育",
			tag: "39333"
		},
		kyxs: {
			title: "科研学术",
			tag: "39312"
		},
		rsgz: {
			title: "人事工作",
			tag: "39306"
		},
		xssz: {
			title: "学生思政",
			tag: "39342"
		},
		dwjl: {
			title: "对外交流",
			tag: "39353"
		},
		jyzd: {
			title: "就业指导",
			tag: "39351"
		}
	};
	const rootUrl = Object.keys(categoryMap).includes(category) ? `${baseUrl}/${categoryMap[category].tag}/list.htm` : `${baseUrl}/39283/list.htm`;
	const $ = load((await got_default(rootUrl)).data);
	const list = $("div.con1rm2rt.xi20").toArray().map((element) => {
		const a = $(element).find("a");
		const title = a.text();
		const href = a.attr("href");
		if (!href || /https?:\/\//i.test(href)) return null;
		return {
			title,
			link: new URL(href, baseUrl).href
		};
	}).filter((item) => item !== null);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		const dateText = content("span.xi14").text().match(/\b\d{4}-\d{2}-\d{2}\b/);
		const pubDate = timezone(parseDate(dateText ? dateText[0] : ""), 8);
		const description = content("div.wp_articlecontent").html();
		return {
			title: item.title,
			pubDate,
			link: item.link,
			guid: item.link,
			description
		};
	})));
	return {
		title: `浙江大学控制学院通知 - ${categoryMap[category]?.title || "简讯专栏"}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
