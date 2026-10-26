import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zcmu/jwc/index.ts
const host = "https://jwc.zcmu.edu.cn/";
const map = /* @__PURE__ */ new Map([
	[0, {
		title: "教务处 -- 教务管理",
		id: "jwgl"
	}],
	[1, {
		title: "教务处 -- 成绩管理",
		id: "jwgl/cjgl"
	}],
	[2, {
		title: "教务处 -- 学籍管理",
		id: "jwgl/xjgl"
	}],
	[3, {
		title: "教务处 -- 考试管理",
		id: "jwgl/ksgl"
	}],
	[4, {
		title: "教务处 -- 选课管理",
		id: "jwgl/xkgl"
	}],
	[5, {
		title: "教务处 -- 排课管理",
		id: "jwgl/pkgl"
	}]
]);
const route = {
	path: "/jwc/:type?",
	categories: ["university"],
	example: "/zcmu/jwc/1",
	parameters: { type: "通知模块id" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["CCraftY"],
	handler,
	description: `| 教务管理 | 成绩管理 | 学籍管理 | 考试管理 | 选课管理 | 排课管理 |
| -------- | -------- | -------- | -------- | -------- | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        |`
};
async function handler(ctx) {
	const type = Number.parseInt(ctx.req.param("type"));
	const id = map.get(type).id;
	const $ = load((await got_default({
		method: "get",
		url: `${host}/${id}.htm`
	})).data);
	const items = $(".winstyle196327 tr:lt(20)").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").attr("title"),
			link: `https://jwc.zcmu.edu.cn/${item.find("a").attr("href")}`,
			pubDate: parseDate(item.find("span.timestyle196327").text().trim())
		};
	});
	return {
		title: map.get(type).title,
		link: `${host}${id}`,
		item: items
	};
}
//#endregion
export { route };
