import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/3dmgame/utils.ts
const parseArticle = (item) => cache_default.tryGet(item.link, async () => {
	const { data: response } = await got_default(item.link);
	const $ = load(response);
	if (item.link.startsWith("https://dl.3dmgame.com/")) {
		const lis = $(".patchtop .lis");
		const [, category, pubDate, author] = lis.text().match(/补丁类型：([^\n]*)\n.*整理时间：([^\n]*)\n.*补丁制作：([^\n]*)\n/s);
		item.description = lis.html() + $(".L_title").html() + $(".GmL_1").html();
		item.category = category;
		item.pubDate = timezone(parseDate(pubDate), 8);
		item.author = author;
	} else {
		item.description = $(".news_warp_center").html();
		item.pubDate = timezone(parseDate($(".time span").text()), 8);
		item.author = $(".intem li:nth-child(2) .name").text().trim();
	}
	return item;
});
//#endregion
export { parseArticle as t };
