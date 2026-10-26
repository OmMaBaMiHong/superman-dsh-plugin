import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/njxzc/utils/index.ts
async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector, listSelector) {
	const response = await rofetch(url);
	if (!response) return [];
	const $ = load(response);
	const list = $(listSelector).toArray().map((item) => {
		item = $(item);
		const href = item.find(titleSelector).attr("href") || "";
		const link = href.startsWith("http") ? href : new URL(href, host).href;
		return {
			title: item.find(titleSelector).attr("title"),
			link,
			pubDate: timezone(parseDate(item.find(dateSelector).text(), "YYYY-MM-DD"), 8)
		};
	});
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load(await rofetch(item.link));
		if ($(".wp_error_msg").length > 0) item.description = "您当前ip并非校内地址，该信息仅允许校内地址访问";
		else {
			const $content = $(contentSelector.content);
			$content.find(".wp_pdf_player").each((_, el) => {
				const $iframe = $(el);
				const pdfSrc = $iframe.attr("pdfsrc") || "";
				const pdfUrl = pdfSrc.startsWith("http") ? pdfSrc : new URL(pdfSrc, host).href;
				$iframe.replaceWith(`<p><a href="${pdfUrl}">附件下载</a></p>`);
			});
			$content.find("a").each((_, el) => {
				const $a = $(el);
				const href = $a.attr("href");
				if (href && !href.startsWith("http")) $a.attr("href", new URL(href, host).href);
			});
			item.description = $content.html() || "";
			item.title = $(contentSelector.title).text();
			item.pubDate = timezone(parseDate($(contentSelector.date).text().replace("编辑：", "").replace("发布日期：", "").replace("发布时间：", ""), "YYYY-MM-DD"), 8);
		}
		return item;
	})));
}
//#endregion
//#region lib/routes/njxzc/home.ts
const url = "https://www.njxzc.edu.cn/89/list.htm";
const host = "https://www.njxzc.edu.cn";
const route = {
	path: "/tzgg",
	categories: ["university"],
	example: "/njxzc/tzgg",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.njxzc.edu.cn/89/list.htm", "www.njxzc.edu.cn/"] }],
	name: "官网通知公告",
	maintainers: ["real-jiakai"],
	handler,
	url: "www.njxzc.edu.cn/89/list.htm"
};
async function handler(ctx) {
	const out = await getNoticeList(ctx, url, host, "a", ".news_meta", {
		title: ".arti_title",
		content: ".wp_articlecontent",
		date: ".arti_update"
	}, ".news_list .news");
	return {
		title: "南京晓庄学院 -- 通知公告",
		link: url,
		item: out
	};
}
//#endregion
export { route };
