import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/sysu/ygafz.ts
const route = {
	path: "/ygafz/:type?",
	categories: ["university"],
	example: "/sysu/ygafz",
	parameters: { type: "分类，见下表，默认为 `notice`" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ygafz.sysu.edu.cn/:type?"] }],
	name: "粤港澳发展研究院",
	description: `| 人才招聘   | 人才培养      | 新闻动态 | 通知公告 | 专家观点 |
| ---------- | ------------- | -------- | -------- | -------- |
| jobopening | personnelplan | news     | notice   | opinion  |

| 研究成果 | 研究论文 | 学术著作 | 形势政策 |
| -------- | -------- | -------- | -------- |
| results  | papers   | writings | policy   |`,
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { type = "notice" } = ctx.req.param();
	const baseUrl = "https://ygafz.sysu.edu.cn";
	const url = `${baseUrl}/${type}`;
	const $ = load(await rofetch(url));
	const list = $(".list-content a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("p").text(),
			link: `${baseUrl}${item.attr("href")}`,
			pubDate: parseDate(item.find(".date").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		item.author = $(".article-submit").text().match(/发布人：(.*)/)[1];
		item.description = $("div[data-block-plugin-id=\"entity_field:node:body\"]").html() + ($("div[data-block-plugin-id=\"entity_field:node:attachments\"]").html() ?? "");
		return item;
	})));
	return {
		title: $("title").text(),
		link: url,
		item: items
	};
}
//#endregion
export { route };
