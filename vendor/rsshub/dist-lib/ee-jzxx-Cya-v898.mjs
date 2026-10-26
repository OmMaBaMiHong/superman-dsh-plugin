import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xjtu/ee-jzxx.ts
const route = {
	path: "/ee/jzxx/:category?",
	categories: ["university"],
	example: "/xjtu/ee/jzxx/bks",
	parameters: { category: "类别：`bks`，默认为首页，详情在描述中" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ee.xjtu.edu.cn/jzxx/:category?.htm"] }],
	name: "电气学院通知",
	maintainers: ["riverflows2333"],
	handler,
	description: `栏目类型

| 主页 | 本科生 | 研究生 | 科研学术 | 采购招标 | 招聘就业 | 行政办公 |
| ---- | ------ | ------ | -------- | -------- | -------- | -------- |
| -    | bks    | yjs    | kyxs     | cgzb     | zpjy     | xzbg     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const baseUrl = "https://ee.xjtu.edu.cn";
	const rootUrl = [
		"bks",
		"yjs",
		"kyxs",
		"cgzb",
		"zpjy",
		"xzbg"
	].includes(category) ? `${baseUrl}/jzxx/${category}.htm` : `${baseUrl}/jzxx.htm`;
	const $ = load((await got_default(rootUrl)).data);
	const list = $(".list .wow.fadeInUp").toArray().map((element) => {
		const a = $(element).find("a");
		const title = a.text();
		const href = a.attr("href");
		if (!href) return null;
		return {
			title,
			link: new URL(href, baseUrl).href
		};
	}).filter((item) => item !== null);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		const pubDate = timezone(parseDate(content("div.art-tit.cont-tit").find("p span:nth-child(1)").text().replace("发布时间：", "")), 8);
		const description = content("div.art-body.wow.fadeInUp").clone().find("ul li").each((_, el) => {
			const $li = $(el);
			const newText = $li.html()?.replaceAll(/已下载[\s\S]*?<\/span>次/g, "") ?? "";
			$li.html(newText.replace(/<\/a>\s*$/, "</a>"));
		}).end().html();
		return {
			title: content("div.art-tit.cont-tit").find("h3").text(),
			pubDate,
			link: item.link,
			guid: item.link,
			description
		};
	})));
	return {
		title: `西安交通大学电气学院通知 - ${{
			bks: "本科生",
			yjs: "研究生",
			kyxs: "科研学术",
			cgzb: "采购招标",
			zpjy: "招聘就业",
			xzbg: "行政办公"
		}[category] || "通知首页"}`,
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
