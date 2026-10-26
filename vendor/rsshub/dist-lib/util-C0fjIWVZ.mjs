import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/jisilu/util.ts
const rootUrl = "https://www.jisilu.cn";
const processItems = async ($, targetEl, limit) => {
	const items = targetEl.find("div.aw-item").toArray().map((item) => {
		const $item = $(item);
		const aEl = $item.find("h4 a");
		const title = aEl.text();
		const link = aEl.prop("href");
		const pubDateStr = $item.find(".aw-text-color-999").text().match(/(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];
		const authorEl = $item.find("a.aw-user-name");
		const author = authorEl.prop("href") ? [{
			name: authorEl.text(),
			url: authorEl.prop("href")
		}] : authorEl.text();
		return {
			title,
			pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : void 0,
			link,
			category: $item.find("span.aw-question-tags a, a.aw-topic-name").toArray().map((c) => $(c).text()),
			author
		};
	});
	return (await Promise.all(items.map((item) => {
		if (!item.link && typeof item.link !== "string") return item;
		return cache_default.tryGet(item.link, async () => {
			const $$ = load(await rofetch(item.link));
			const title = $$("div.aw-mod-head h1").text();
			if (!title) return item;
			const isAnswer = item.link ? /answer_id/.test(item.link) : false;
			const description = (isAnswer ? $$("div.markitup-box").last() : $$("div.markitup-box").first()).html() ?? "";
			const metaStr = $$(isAnswer ? "div.aw-dynamic-topic-meta" : "div.aw-question-detail-meta").find("span.aw-text-color-999").text();
			const pubDateStr = metaStr.match(isAnswer ? /(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/ : /发表时间\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];
			const updatedStr = metaStr.match(/最后修改时间\s(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2})/)?.[1];
			const authorEl = $$(isAnswer ? "p.publisher a.aw-user-name" : "div.aw-side-bar-mod-body a.aw-user-name").first();
			const author = authorEl.prop("href") ? [{
				name: authorEl.text(),
				url: authorEl.prop("href"),
				avatar: authorEl.parent().parent().find("img").first().prop("src")
			}] : authorEl.text();
			return {
				title,
				description,
				pubDate: pubDateStr ? timezone(parseDate(pubDateStr), 8) : item.pubDate,
				link: item.link,
				category: item.category,
				author,
				content: {
					html: description,
					text: $$("div.aw-question-detail-txt").first().text()
				},
				updated: updatedStr ? timezone(parseDate(updatedStr), 8) : item.updated
			};
		});
	}))).filter((_) => true).slice(0, limit);
};
//#endregion
export { rootUrl as n, processItems as t };
