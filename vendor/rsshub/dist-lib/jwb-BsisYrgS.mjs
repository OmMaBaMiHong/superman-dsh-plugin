import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/dgut/jwb.ts
const route = {
	path: "/jwb/:type?",
	categories: ["university"],
	example: "/dgut/jwb/jwtz",
	parameters: { type: "哪种通知，默认为教务通知" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	maintainers: ["1200522928"],
	radar: [{
		source: ["jwb.dgut.edu.cn/tzgg/"],
		target: ""
	}],
	name: "教务部通知公告",
	description: `| 教学动态 | 教务通知 | 教研通知 | 实践通知 | 产业学院 | 通识教育 | "杨振宁" 班 | 招生信息 | 采购公告 |
| -------- | -------- | -------- | -------- | -------- | -------- | ----------- | -------- | -------- |
| jxdt     | jwtz     | jytz     | sjtz     | cyxy     | tsjy     | yznb        | zsxx     | cggg     |`,
	handler
};
async function handler(ctx) {
	const { type = "jwtz" } = ctx.req.param();
	const url = `https://jwb.dgut.edu.cn/tzgg/${type}.htm`;
	const baseurl = "https://jwb.dgut.edu.cn/";
	const $ = load(await rofetch(url));
	const list = $("ul.ul-new4 > li").toArray().map((item) => {
		const $a = $(item).find("a.con");
		return {
			title: $a.find(".tit").text().trim(),
			pubDate: parseDate(`${$a.find(".year").text().trim()}-${$a.find(".day").text().trim()}`),
			link: `${baseurl}${$a.attr("href")}`
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		return {
			...item,
			description: $("div.v_news_content").html()
		};
	})));
	return {
		title: $("title").text(),
		link: url,
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
