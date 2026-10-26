import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ucas/index.ts
const rootUrl = "https://zhaopin.ucas.ac.cn";
const idMap = {
	jxkyrc: 3,
	glzcrc: 4,
	ktxmpy: 5,
	bsh: 6
};
const titleMap = {
	jxkyrc: "教学科研人才",
	glzcrc: "管理支撑人才",
	ktxmpy: "课题项目聘用",
	bsh: "博士后"
};
const route = {
	path: "/job/:type?",
	categories: ["university"],
	example: "/ucas/job",
	parameters: { type: "招聘类型，默认为博士后" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "招聘信息",
	maintainers: ["Fatpandac"],
	handler,
	description: `| 招聘类型 | 博士后 | 课题项目聘用 | 管理支撑人才 | 教学科研人才 |
| :------: | :----: | :----------: | :----------: | :----------: |
|   参数   |   bsh  |    ktxmpy    |    glzcrc    |    jxkyrc    |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "bsh";
	const url = `${rootUrl}/gjob/login.do?method=contentList&t=zhaopin&c=${idMap[type]}`;
	const $ = load((await got_default.get(url)).data);
	const list = $("#col1_content > div.list > ul > li").toArray();
	const items = await Promise.all(list.map(async (item) => {
		const title = $(item).find("a").attr("title");
		const link = rootUrl + $(item).find("a").attr("href");
		return {
			title,
			link,
			pubDate: parseDate($(item).find("span").text()),
			description: await cache_default.tryGet(link, async () => {
				const pageContent = load((await got_default.get(link)).data);
				return pageContent("#col1_content > div.content_head > div.top").html() + pageContent("#col1_content > div.entry").html();
			})
		};
	}));
	return {
		title: `中国科学院大学招聘 - ${titleMap[type]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
