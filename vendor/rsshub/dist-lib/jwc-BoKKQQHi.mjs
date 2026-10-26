import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/jwc.ts
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/nankai/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.nankai.edu.cn/tzgg/list.htm"],
		target: "/jwc"
	}],
	name: "教务处通知公告",
	maintainers: ["vicguo0724"],
	description: "南开大学教务处通知公告",
	url: "jwc.nankai.edu.cn",
	handler: async () => {
		const baseUrl = "https://jwc.nankai.edu.cn";
		const { data: response } = await got_default(`${baseUrl}/tzgg/list.htm`);
		const $ = load(response);
		const list = $(".page-con-list-news .item").toArray().map((item) => {
			const $item = $(item);
			const $link = $item.find(".t a");
			const $dateDay = $item.find(".d .d-d");
			const $dateMonth = $item.find(".d .d-m");
			const day = $dateDay.text().trim();
			const fullDate = `${$dateMonth.text().trim()}/${day}`;
			let linkStr = $link.attr("href");
			if (linkStr && !linkStr.startsWith("http")) linkStr = `${baseUrl}${linkStr}`;
			return {
				title: $link.text().trim(),
				link: linkStr,
				pubDate: timezone(parseDate(fullDate, "YYYY/MM/DD"), 8)
			};
		}).filter((item) => item.link);
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const { data: response } = await got_default(item.link);
				const $ = load(response);
				const timeMatch = $(".page-news-souse").text().match(/发布时间：(\d{4}-\d{2}-\d{2})/);
				if (timeMatch) item.pubDate = timezone(parseDate(timeMatch[1]), 8);
				const content = $(".page-news-con .wp_articlecontent");
				if (content.length > 0) {
					content.find("a").each((i, el) => {
						const $el = $(el);
						const href = $el.attr("href");
						if (href && !href.startsWith("http")) if (href.startsWith("/")) $el.attr("href", `${baseUrl}${href}`);
						else $el.attr("href", `${baseUrl}/${href}`);
					});
					content.find(".wp_pdf_player").each((i, el) => {
						const $el = $(el);
						const pdfSrc = $el.attr("pdfsrc");
						const sudyfileAttr = ($(el).attr("sudyfile-attr") || "{}").replaceAll("'", "\"");
						const fileName = JSON.parse(sudyfileAttr).title || "未命名文件.pdf";
						if (pdfSrc) {
							let pdfUrl = pdfSrc;
							if (!pdfUrl.startsWith("http")) pdfUrl = `${baseUrl}${pdfUrl}`;
							$el.replaceWith(`<p><a href="${pdfUrl}" target="_blank">${fileName}</a></p>`);
						}
					});
					item.description = content.html();
				} else item.description = "无法获取内容详情";
			} catch {
				item.description = "获取内容失败";
			}
			return item;
		})));
		return {
			title: "南开大学教务处-通知公告",
			link: `${baseUrl}/tzgg/list.htm`,
			item: items
		};
	}
};
//#endregion
export { route };
