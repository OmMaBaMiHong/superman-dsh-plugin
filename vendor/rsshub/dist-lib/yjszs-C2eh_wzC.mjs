import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { load } from "cheerio";
//#region lib/routes/nudt/yjszs.ts
const host = "http://yjszs.nudt.edu.cn";
const yjszs = /* @__PURE__ */ new Map([
	["2", { title: "国防科技大学研究生院 - 通知公告" }],
	["1", { title: "国防科技大学研究生院 - 首页" }],
	["8", { title: "国防科技大学研究生院 - 招生简章" }],
	["12", { title: "国防科技大学研究生院 - 学校政策" }],
	["16", { title: "国防科技大学研究生院 - 硕士招生" }],
	["17", { title: "国防科技大学研究生院 - 博士招生" }],
	["23", { title: "国防科技大学研究生院 - 院所发文" }],
	["25", { title: "国防科技大学研究生院 - 数据统计" }]
]);
const route = {
	path: "/yjszs/:keyId?",
	categories: ["university"],
	example: "/nudt/yjszs/2",
	parameters: { keyId: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yjszs.nudt.edu.cn"] }],
	name: "研究生院",
	maintainers: ["Blank0120"],
	handler,
	url: "yjszs.nudt.edu.cn/",
	description: `| 通知公告 | 首页 | 招生简章 | 学校政策 | 硕士招生 | 博士招生 | 院所发文 | 数据统计 |
| -------- | ---- | -------- | -------- | -------- | -------- | -------- | -------- |
| 2        | 1    | 8        | 12       | 16       | 17       | 23       | 25       |`
};
async function handler(ctx) {
	const keyId = ctx.req.param("keyId") ?? "2";
	const info = yjszs.get(keyId);
	if (!info) throw new InvalidParameterError("invalid keyId");
	let link = `${host}/pubweb/homePageList`;
	link += keyId === "2" ? "/searchContent.view" : `/recruitStudents.view?keyId=${keyId}`;
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const items = $(".news-list li").toArray().map((elem) => {
		elem = $(elem);
		return {
			link: new URL(elem.find("a").attr("href"), host).href,
			title: elem.find("h3").text().trim(),
			pubDate: timezone(parseDate(elem.find(".time").text(), "YYYY-MM-DD"), -8)
		};
	});
	return {
		title: info.title,
		link,
		item: items
	};
}
//#endregion
export { route };
