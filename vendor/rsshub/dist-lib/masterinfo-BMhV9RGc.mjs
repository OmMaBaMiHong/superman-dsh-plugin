import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ncepu/master/masterinfo.ts
const title_map = {
	tzgg: "通知公告",
	zsxx: "硕士招生信息",
	pyxx: "研究生培养信息"
};
const description_map = {
	tzgg: "通知公告",
	zsxx: "硕士招生信息",
	pyxx: "研究生培养信息"
};
const url_map = {
	tzgg: "tzgg",
	zsxx: "zsxx/sszsxx",
	pyxx: "pyxx/pyxx"
};
const route = {
	path: "/master/:type",
	categories: ["university"],
	example: "/ncepu/master/tzgg",
	parameters: { type: "类型参数" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "北京校区研究生院",
	maintainers: ["nilleo"],
	handler,
	description: `| 类型 | 硕士招生信息 | 通知公告 | 研究生培养信息 |
| ---- | ------------ | -------- | -------------- |
| 参数 | zsxx         | tzgg     | pyxx           |`
};
async function handler(ctx) {
	const type = ctx.req.param("type");
	const data = (await got_default(`https://yjsy.ncepu.edu.cn/${url_map[type]}/index.htm`)).data;
	const $ = load(data);
	const list = $(".articleList ul li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		const pubDate = timezone(parseDate(item.find("span").text().replace("[", "").replace("]", "")), 8);
		const url = `https://yjsy.ncepu.edu.cn/${url_map[type]}/` + a.attr("href");
		return {
			title: a.attr("title"),
			link: url,
			pubDate
		};
	});
	const items = await Promise.all(list.map(async (item) => {
		const content = load(await cache_default.tryGet(item.link, async () => (await got_default(item.link)).data));
		const articleAuthor = content(".articleAuthor").html().replace("作者：&nbsp;&nbsp;", "").replace("来源：&nbsp;&nbsp;", "");
		const eDescription = content(".article").html();
		const files = content(".Annex").html() || "";
		return {
			title: item.title,
			link: item.link,
			description: articleAuthor + eDescription + files,
			pubDate: item.pubDate
		};
	}));
	return {
		title: `${title_map[type]}-华北电力大学研究生院`,
		link: `http://yjsy.ncepu.edu.cn/${url_map[type]}`,
		description: `华北电力大学研究生院${description_map[type]}`,
		item: items
	};
}
//#endregion
export { route };
