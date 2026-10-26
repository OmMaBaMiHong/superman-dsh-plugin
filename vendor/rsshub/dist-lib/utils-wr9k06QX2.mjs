import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gxmzu/utils/index.ts
async function getNoticeList(ctx, url, host, titleSelector, dateSelector, contentSelector) {
	const response = await rofetch(url);
	if (!response) return [];
	const $ = load(response);
	const list = $("tr[height=20]").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(titleSelector).attr("title"),
			link: new URL(item.find(titleSelector).attr("href"), host).href,
			pubDate: timezone(parseDate(item.find(dateSelector).text().trim(), "YYYY-MM-DD"), 8)
		};
	});
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		if (item.link.includes(".jsp")) return {
			...item,
			description: "该通知无法直接预览，请点击原文链接↑查看"
		};
		const response = await rofetch(item.link);
		if (!response || response.status >= 300 && response.status < 400) item.description = "该通知无法直接预览，请点击原文链接↑查看";
		else {
			const $ = load(response);
			item.title = $(contentSelector.title).text();
			if ($("script:contains(\"showVsbpdfIframe\")").length > 0) item.description = "该通知无法直接预览，请点击原文链接↑查看";
			else {
				const $content = load($(contentSelector.content).html());
				$content("a").each((_, el) => {
					const a = $(el);
					const href = a.attr("href");
					if (href && !href.startsWith("http")) a.attr("href", new URL(href, host).href);
				});
				item.description = $content.html();
			}
			item.pubDate = timezone(parseDate($(contentSelector.date).text().replaceAll(/年|月/g, "-").replaceAll("日", "")), 8);
		}
		return item;
	})));
}
//#endregion
export { getNoticeList as t };
