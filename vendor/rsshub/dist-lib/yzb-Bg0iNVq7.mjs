import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/yzb.ts
const route = {
	path: "/yzb/:type?",
	categories: ["university"],
	example: "/nankai/yzb/5509",
	parameters: { type: "栏目名（若为空则默认为“硕士招生”）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["yzb.nankai.edu.cn", "yzb.nankai.edu.cn/:type/list.htm"],
		target: "/yzb/:type?"
	}],
	name: "研究生招生网",
	maintainers: ["sddzhyc"],
	description: `| 硕士招生 | 博士招生 | 港澳台研究生最新信息 |
| -------- | -------- | -------------------- |
| 5509     | 2552     | 2562                 |`,
	url: "yzb.nankai.edu.cn",
	handler: async (ctx) => {
		const { type = "5509" } = ctx.req.param();
		const baseUrl = "https://yzb.nankai.edu.cn";
		const { data: response } = await got_default(`${baseUrl}/${type}/list.htm`);
		const $ = load(response);
		const dateList = $("#wp_news_w9").find("span.col_news_date").toArray().map((item) => $(item).text());
		const list = $("#wp_news_w9").find("a[title]").toArray().map((element, index) => {
			const $a = $(element);
			let linkStr = $a.attr("href") || "";
			linkStr = linkStr.startsWith("http://") ? linkStr.replace("http://", "https://") : `${baseUrl}${linkStr}`;
			return {
				title: $a.text(),
				link: linkStr,
				pubDate: timezone(parseDate(dateList[index]), 8)
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link.toString(), async () => {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			item.description = $(".read").first().html();
			const pdfLinks = $("div[pdfsrc$=\".pdf\"]").toArray().map((el) => {
				const pdfUrl = $(el).attr("pdfsrc") || "";
				const sudyfileAttr = ($(el).attr("sudyfile-attr") || "{}").replaceAll("'", "\"");
				const fileName = JSON.parse(sudyfileAttr).title || "未命名文件.pdf";
				return `<a href="${new URL(pdfUrl, baseUrl).href}">${fileName}</a>`;
			}).join("<br>");
			if (pdfLinks) item.description += `<h4>相关附件：</h4>${pdfLinks}`;
			return item;
		})));
		return {
			title: `南开大学研究生招生网-${$(".column-title").text()}`,
			link: `${baseUrl}/${type}/list.htm`,
			item: items
		};
	}
};
//#endregion
export { route };
