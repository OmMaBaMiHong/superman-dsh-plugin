import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/2cycd/index.ts
const route = {
	path: "/:fid/:sort?",
	name: "Unknown",
	maintainers: ["shelken"],
	handler
};
async function handler(ctx) {
	const currentUrl = `http://www.2cycd.com/forum.php?mod=forumdisplay&fid=${ctx.req.param("fid") ?? "43"}&orderby=${ctx.req.param("sort") ?? "dateline"}`;
	const response = await got_default(currentUrl, { responseType: "buffer" });
	const $ = load(iconv.decode(response.data, "gbk"));
	const list = $("tbody[id^=\"normalthread_\"]").toArray().map((item) => {
		item = $(item);
		const xst = item.find("a.s.xst");
		const author = item.find("td.by cite a").eq(0).text();
		return {
			title: xst.text(),
			link: xst.attr("href"),
			author
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link, { responseType: "buffer" });
		const content = load(iconv.decode(detailResponse.data, "gbk"));
		const first_post = content("td[id^=\"postmessage_\"]").first();
		const dateobj = content("em[id^=\"authorposton\"]").first();
		item.description = first_post.html();
		item.pubDate = timezone(parseDate(dateobj.find("span").attr("title"), "YYYY-M-D HH:mm:ss"), 8);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
