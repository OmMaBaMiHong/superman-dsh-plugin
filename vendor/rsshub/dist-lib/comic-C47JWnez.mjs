import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import LZString from "lz-string";
//#region lib/routes/manhuagui/comic.ts
let baseUrl = "";
const getChapters = ($) => {
	let time_mark = 100;
	let new_time_mark = 0;
	const result = [];
	$("h4").each((_, ele) => {
		const categoryName = $(ele).text();
		let nextEle = ele.next;
		while (nextEle && !$(nextEle).hasClass("chapter-list")) nextEle = nextEle.next;
		if (!nextEle) return;
		for (const ul of $(nextEle).children("ul").toArray().toReversed()) for (const li of $(ul).children("li").toArray()) {
			const a = $(li).children("a");
			let pDate = /* @__PURE__ */ new Date(new Date($.pubDate) - time_mark++ * 1e3);
			if (a.find("em").length > 0) {
				pDate = /* @__PURE__ */ new Date(new Date($.pubDate) - new_time_mark++ * 1e3);
				$.newChapterCnt++;
			}
			result.push({
				link: new URL(a.attr("href"), baseUrl).href,
				title: a.attr("title"),
				pub_date: pDate,
				num: a.find("i").text(),
				category: categoryName
			});
		}
	});
	return result;
};
const route = {
	path: ["/comic/:id/:chapterCnt?", "/:domain?/comic/:id/:chapterCnt?"],
	categories: ["anime"],
	example: "/manhuagui/comic/22942/5",
	parameters: {
		id: "漫画ID",
		chapterCnt: "返回章节的数量，默认为0，返回所有章节"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: [{
		source: ["www.mhgui.com/comic/:id/"],
		target: "/comic/:id"
	}],
	name: "漫画更新",
	maintainers: ["MegrezZhu"],
	handler
};
async function handler(ctx) {
	const { id, domain } = ctx.req.param();
	if (domain === "mhgui") baseUrl = "https://www.mhgui.com";
	else if (domain === "twmanhuagui") baseUrl = "https://tw.manhuagui.com";
	else baseUrl = "https://www.manhuagui.com";
	const chapterCnt = Number(ctx.req.param("chapterCnt") || 0);
	const { data } = await got_default(`${baseUrl}/comic/${id}/`);
	const $ = load(data);
	if ($("#__VIEWSTATE").length > 0) {
		const n = LZString.decompressFromBase64($("#__VIEWSTATE").val());
		if (n) {
			$("#erroraudit_show").replaceWith(n);
			$("#__VIEWSTATE").remove();
		}
	}
	const bookTitle = $(".book-title > h1").text();
	const bookIntro = $("#intro-all").text();
	if ($(".status > span").text().indexOf("已下架") > 0) return {
		title: `看漫画 - ${bookTitle} 已下架`,
		link: `${baseUrl}/comic/${id}/`,
		description: bookIntro,
		item: [{
			link: `${baseUrl}/comic/${id}/`,
			title: bookTitle,
			description: "已下架"
		}]
	};
	const coverImgSrc = $(".book-cover img").attr("src");
	$.pubDate = parseDate($(".status > span").text().match(/最近[于於].+更新至/)[0].replace(/最近[于於] \[/, "").replace("] 更新至", ""));
	$.newChapterCnt = 0;
	const chapters = getChapters($);
	const genResult = (chapter) => ({
		link: chapter.link,
		title: chapter.title,
		pubDate: chapter.pub_date,
		category: chapter.category,
		description: `
            <h1>${chapter.num}</h1>
            <img src='${coverImgSrc}' />
        `.trim()
	});
	const items = chapters.map((element) => genResult(element));
	let itemsLen = items.length;
	if (chapterCnt > 0) itemsLen = Math.max(chapterCnt, $.newChapterCnt);
	return {
		title: `看漫画 - ${bookTitle}`,
		link: `${baseUrl}/comic/${id}/`,
		description: bookIntro,
		item: items.slice(0, itemsLen)
	};
}
//#endregion
export { route };
