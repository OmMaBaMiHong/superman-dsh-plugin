import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nwafu/utils.ts
const nwafuMap = /* @__PURE__ */ new Map([
	["lib", [
		"https://lib.nwafu.edu.cn/gg/",
		".pageList ul li",
		"li a",
		".pageArticle",
		"西北农林科技大学图书馆通知公告"
	]],
	["youth", [
		"https://54youth.nwsuaf.edu.cn/twsy/tzgg//",
		"section ul li",
		"li a",
		"article",
		"共青团西北农林科技大学委员会通知公告"
	]],
	["cie", [
		"https://cie.nwsuaf.edu.cn/dtytz/tzgg/",
		"ul.list  li",
		"li a",
		".article",
		"西北农林科技大学信息工程学院通知公告"
	]],
	["gs", [
		"https://gs.nwsuaf.edu.cn/tzggB/",
		"dl#sort ul.list  li",
		"li a",
		".content",
		"西北农林科技大学后勤管理处通知公告"
	]],
	["jcc", [
		"https://jcc.nwsuaf.edu.cn/tzgg/",
		"dl#sort ul.list  li",
		"li a",
		".content",
		"西北农林科技大学计划财务处通知公告"
	]],
	["jiaowu", [
		"https://jiaowu.nwsuaf.edu.cn/tzggB/",
		".list-i ul li",
		"li a",
		"article",
		"西北农林科技大学教务通知公告"
	]],
	["news", [
		"https://news.nwafu.edu.cn/yxxw/",
		"ul.NWAFU-list01  li",
		"li a",
		".pageArticle",
		"西北农林科技大学新闻网聚焦院处"
	]],
	["nic", [
		"https://nic.nwsuaf.edu.cn/tzgg1/",
		"dl#sort ul.list  li",
		"li a",
		".content",
		"西北农林科技大学信息化管理处通知公告"
	]],
	["yjshy", [
		"https://yjshy.nwafu.edu.cn/tzgg/",
		".sort_rightcont ul  li",
		"li a",
		".cont",
		"西北农林科技大学研究生院通知公告"
	]],
	["nxy", [
		"https://nxy.nwafu.edu.cn/xytz/tzgg_xwzx/",
		"div.sort_rightcont ul li",
		"li a",
		"div.sort_rightcont2",
		"西北农林科技大学农业科学院通知公告"
	]],
	["cmee", [
		"https://cmee.nwafu.edu.cn/xwzx/xytz/",
		"div.sort_rightcont ul li",
		"li a",
		"div.sort_rightcont2",
		"西北农林科技大学机械与电子工程学院通知公告"
	]],
	["xshd", [
		"https://www.nwafu.edu.cn/xshd/",
		"ul.subArticleList li",
		"li a",
		".article",
		"西北农林科技大学学术活动"
	]],
	["sm", [
		"https://sm.nwafu.edu.cn/tzgg/",
		"ul.leading-12 li",
		"li a",
		"article",
		"西北农林科技大学生命科学学院通知公告"
	]],
	["forbiddenList", [
		"kjtg.nwafu.edu.cn",
		"kjtg.nwsuaf.edu.cn",
		"fwoa.nwafu.edu.cn",
		"fwoa.nwsuaf.edu.cn",
		"cg.nwafu.edu.cn",
		"cg.nwsuaf.edu.cn"
	]]
]);
//#endregion
//#region lib/routes/nwafu/all.ts
const route = {
	path: "/:type?",
	categories: ["university"],
	example: "/nwafu/lib",
	parameters: { type: "默认为 `jiaowu`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "校园要闻",
	maintainers: ["karinido"],
	handler,
	description: `通知类别

| 图书馆 | 共青团团委 | 信工学院 | 后勤管理处 | 计划财务处 | 教务处 | 新闻网 | 信息化管理处 | 研究生院 | 农业科学院 | 机械与电子工程学院 | 学术活动 | 生命科学学院 |
| ------ | ---------- | -------- | ---------- | ---------- | ------ | ------ | ------------ | -------- | ---------- | ------------------ | -------- | ------------ |
| lib    | youth      | cie      | gs         | jcc        | jiaowu | news   | nic          | yjshy    | nxy        | cmee               | xshd     | sm           |`
};
async function handler(ctx) {
	const { type = "jiaowu" } = ctx.req.param();
	const $ = load((await got_default.get(nwafuMap.get(type)[0])).data);
	const list = $(nwafuMap.get(type)[1]).toArray().map((ele) => {
		return {
			title: $(ele).find(nwafuMap.get(type)[2]).text(),
			pubDate: parseDate($(ele).find("span").text(), "YYYY/MM/DD"),
			link: new URL($(ele).find(nwafuMap.get(type)[2]).attr("href"), nwafuMap.get(type)[0]).href
		};
	});
	const out = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (nwafuMap.get("forbiddenList").includes(new URL(item.link).hostname)) return item;
		item.description = load((await got_default.get(item.link)).data)(nwafuMap.get(type)[3]).html();
		return item;
	})));
	return {
		title: nwafuMap.get(type)[4],
		link: nwafuMap.get(type)[0],
		description: nwafuMap.get(type)[4],
		item: out
	};
}
//#endregion
export { route };
