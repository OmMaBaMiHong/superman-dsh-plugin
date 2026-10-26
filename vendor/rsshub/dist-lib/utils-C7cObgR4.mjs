import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/jou/utils/index.ts
async function getItems(ctx, url, host, tableClass, timeStyleClass1, titleStyleClass, timeStyleClass2) {
	const response = await rofetch(url);
	if (!response) return [];
	const $ = load(response);
	const list = $(`table.${tableClass} > tbody > tr[height=20]`).toArray().map((item) => {
		const currentItem = $(item);
		const item1 = currentItem.find("td:eq(1)");
		const item2 = currentItem.find("td:eq(2)");
		const link = new URL(item1.find("a").attr("href"), host).href;
		return {
			title: item1.find("a").attr("title"),
			link,
			pubDate: timezone(parseDate(item2.find(`.${timeStyleClass1}`).text(), "YYYY-MM-DD"), 8)
		};
	});
	return await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const response = await rofetch(item.link);
		if (!response || response.status >= 300 && response.status < 400) return {
			...item,
			description: "该通知无法直接预览，请点击原文链接↑查看"
		};
		const $ = load(response);
		item.title = $(`.${titleStyleClass}`).text();
		if ($("script:contains(\"showVsbpdfIframe\")").length > 0) item.description = "该通知无法直接预览，请点击原文链接↑查看";
		else {
			const $content = load($(".v_news_content").html());
			$content("a").each((_, el) => {
				const a = $(el);
				const href = a.attr("href");
				if (href && !href.startsWith("http")) a.attr("href", new URL(href, host).href);
			});
			item.description = $content.html();
		}
		item.pubDate = timezone(parseDate($(`.${timeStyleClass2}`).text().replace("发布时间：", "")), 8);
		return item;
	})));
}
//#endregion
export { getItems as t };
