import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/miyuki/news.ts
const ORIGIN = "https://www.miyuki.jp";
const NEWS_LINK = `${ORIGIN}/s/y10/news/list`;
const DETAIL_HEADER_SELECTOR = [
	".pc__news_detail__title",
	".pc__news_detail__title__japanese",
	".news_detail__date",
	".news_detail__title",
	".news_detail__ganre"
].join(", ");
const route = {
	path: "/news",
	example: "/miyuki/news",
	name: "News",
	url: "www.miyuki.jp/s/y10/news/list",
	categories: ["new-media"],
	maintainers: ["KarasuShin"],
	features: { supportRadar: true },
	handler,
	radar: [{
		source: ["miyuki.jp", "miyuki.jp/s/y10/news/list"],
		target: "/news"
	}]
};
async function handler() {
	const $ = load(await rofetch(NEWS_LINK));
	const items = await Promise.all($(".list__side_border li").toArray().map((item) => {
		const $item = $(item);
		const link = `${ORIGIN}${$item.find("a").attr("href")}`;
		return cache_default.tryGet(link, async () => {
			const category = $item.find("p span").last().text();
			return {
				title: $item.find("a").text(),
				link,
				pubDate: timezone(parseDate($item.find("p span").first().text()), 9),
				category: [category],
				description: await getDescription(link)
			};
		});
	}));
	return {
		title: "中島みゆき Official - News",
		link: NEWS_LINK,
		item: items
	};
}
async function getDescription(link) {
	const $ = load(await rofetch(link));
	const content = $(".contents_area__inner");
	content.children(DETAIL_HEADER_SELECTOR).remove();
	normalizePhotoLists($, content);
	content.children().each((_, element) => {
		const child = $(element);
		if (!hasMeaningfulHtml(child.html())) child.remove();
	});
	return content.html()?.trim() ?? "";
}
function hasMeaningfulHtml(html) {
	return Boolean(html?.replaceAll(/<br\s*\/?>/g, "").replaceAll("&nbsp;", "").trim());
}
function normalizePhotoLists($, content) {
	content.find(".news_detail__photo_list").each((_, element) => {
		const list = $(element);
		const items = list.children("li").toArray().flatMap((item) => {
			const photoItem = $(item);
			photoItem.find("img.for_sp").remove();
			photoItem.find("img").each((__, image) => {
				const img = $(image);
				const src = img.attr("src");
				if (!src) {
					img.remove();
					return;
				}
				img.attr("src", new URL(src, ORIGIN).href);
				img.removeAttr("class");
			});
			const html = photoItem.html();
			return hasMeaningfulHtml(html) ? [`<div>${html.trim()}</div>`] : [];
		});
		list.replaceWith(items.join("<br /><br />"));
	});
}
//#endregion
export { route };
