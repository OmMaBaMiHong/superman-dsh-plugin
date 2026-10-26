import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/jianshu/utils.ts
const loadContent = async (link) => {
	const $ = load((await got_default.get(link)).data);
	const pubDate = timezone(parseDate($("time").attr("datetime")), 8);
	$(".image-container, .image-container-fill").removeAttr("style");
	$(".video-package").each((index, elem) => {
		const $item = $(elem);
		const desc = $item.find(".video-description").html();
		const url = $item.attr("data-video-url");
		$item.html(`
            <p>${desc}</p>
            <iframe frameborder="0" src="${url}" allowFullScreen="true"></iframe>
        `);
	});
	return {
		description: $("article").html(),
		pubDate
	};
};
const ProcessFeed = (list, caches) => {
	const host = "https://www.jianshu.com";
	return Promise.all(list.map((item) => {
		const $ = load(item);
		const $title = $(".title");
		const itemUrl = new URL($title.attr("href"), host).href;
		return caches.tryGet(itemUrl, async () => {
			const other = await loadContent(itemUrl);
			return {
				title: $title.text(),
				link: itemUrl,
				author: $(".nickname").text(),
				...other
			};
		});
	}));
};
var utils_default = { ProcessFeed };
//#endregion
export { utils_default as t };
