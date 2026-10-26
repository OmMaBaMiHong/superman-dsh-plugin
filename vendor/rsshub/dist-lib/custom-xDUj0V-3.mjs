import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/zju/cst/custom.ts
async function getPage(id) {
	const $ = load((await got_default({
		method: "get",
		url: `http://www.cst.zju.edu.cn/${id}/list.htm`
	})).data);
	return $(".lm_new ul li").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("a").text(),
			pubDate: parseDate(item.find(".fr").text()),
			link: item.find("a").attr("href")
		};
	});
}
const route = {
	path: "/cst/custom/:id",
	categories: ["university"],
	example: "/zju/cst/custom/36194+36241+36246",
	parameters: { id: "提取出通知页面中的 `ID`，如 `http://www.cst.zju.edu.cn/36246/list.htm` 中的 `36246`，可将你想获取通知的多个页面，通过 `+` 符号来聚合。" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "软件学院",
	maintainers: ["zwithz"],
	handler,
	description: `| 全部通知 | 招生信息 | 教务管理 | 论文管理 | 思政工作 | 评奖评优 | 实习就业 | 国际实习 | 国内合作科研 | 国际合作科研 | 校园服务 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | ------------ | ------------ | -------- |
| 0        | 1        | 2        | 3        | 4        | 5        | 6        | 7        | 8            | 9            | 10       |

#### 自定义聚合通知 {#zhe-jiang-da-xue-ruan-jian-xue-yuan-zi-ding-yi-ju-he-tong-zhi}`
};
async function handler(ctx) {
	const tasks = ctx.req.param("id").split("+").map((id) => getPage(id));
	const results = await Promise.all(tasks);
	let items = [];
	for (const result of results) items = [...items, ...result];
	return {
		title: "浙江大学软件学院通知",
		link: "http://www.cst.zju.edu.cn/",
		item: items
	};
}
//#endregion
export { route };
