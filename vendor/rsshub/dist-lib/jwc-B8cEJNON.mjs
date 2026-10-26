import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as data_default, t as index } from "./extractor-f-DRFfdP.mjs";
import { load } from "cheerio";
//#region lib/routes/sdu/wh/jwc.ts
const route = {
	path: "/wh/jwc/:column?",
	categories: ["university"],
	example: "/sdu/wh/jwc/gztz",
	parameters: { column: "专栏名称，默认为工作通知（`gztz`）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处",
	maintainers: ["kxxt"],
	handler,
	description: `| 规章制度 | 专业建设 | 实践教学 | 支部风采 | 服务指南 | 教务要闻 | 工作通知 | 教务简报 | 常用下载 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| gzzd     | zyjs     | sjjx     | zbfc     | fwzn     | jwyw     | gztz     | jwjb     | cyxz     |`
};
async function handler(ctx) {
	const column = ctx.req.param("column") ?? "gztz";
	const baseUrl = data_default.wh.jwc.url;
	const $ = load((await got_default(baseUrl + data_default.wh.jwc.columns[column].url)).data);
	const items = $(".articleul li");
	const out = await Promise.all(items.map(async (index$1, item) => {
		item = $(item);
		const anchor = item.find("a");
		const dateElement = item.find("div:last-of-type");
		const dateText = dateElement.text();
		dateElement.remove();
		const href = anchor.attr("href");
		const link = href.startsWith("http") ? href : baseUrl + href;
		const title = item.text();
		const { description, author: exactAuthor, exactDate } = await cache_default.tryGet(link, () => index(link));
		const author = exactAuthor ?? "教务处";
		return {
			title,
			link,
			description,
			pubDate: exactDate ?? timezone(parseDate(dateText.slice(1, -1), "YYYY-MM-DD"), 8),
			author
		};
	}));
	return {
		title: `${data_default.wh.jwc.name} ${data_default.wh.jwc.columns[column].name}`,
		link: baseUrl + data_default.wh.jwc.columns[column].url,
		item: out
	};
}
//#endregion
export { route };
