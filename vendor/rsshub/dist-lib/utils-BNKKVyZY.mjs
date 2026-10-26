import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/csust/utils.ts
async function getNoticeContent(item) {
	const $content = load((await got_default(item.link)).body)(".v_news_content");
	if ($content.length) {
		$content.find("script").remove();
		$content.find("style").remove();
		$content.find(".vsbcontent_end").remove();
		$content.find("iframe").remove();
		item.description = $content.html() || item.title;
	} else item.description = item.title;
	return item;
}
function parseListItems($, baseUrl) {
	return $(".list ul li").toArray().map((li) => {
		const element = $(li);
		const title = element.find(".newTitle").text().trim();
		const linkRaw = element.find("a").attr("href");
		const dateText = element.find(".data1").text().trim();
		if (!linkRaw || !title) return null;
		const dateMatch = dateText.match(/发布时间\s*[:：]\s*(\d{4}-\d{1,2}-\d{1,2})/);
		const pubDate = dateMatch ? parseDate(dateMatch[1]) : null;
		return {
			title,
			link: linkRaw.startsWith("http") ? linkRaw : new URL(linkRaw, baseUrl).href,
			pubDate
		};
	}).filter((i) => i !== null);
}
function createCsustHandler({ listPath, feedTitle, feedDescription }) {
	const baseUrl = "https://www.csust.edu.cn";
	return async function() {
		const items = parseListItems(load((await got_default(`${baseUrl}${listPath}`)).body), baseUrl);
		const item = await Promise.all(items.map((it) => cache_default.tryGet(it.link, async () => {
			try {
				return await getNoticeContent(it);
			} catch {
				return it;
			}
		})));
		return {
			title: feedTitle,
			link: `${baseUrl}${listPath}`,
			description: feedDescription,
			item
		};
	};
}
//#endregion
export { createCsustHandler as t };
