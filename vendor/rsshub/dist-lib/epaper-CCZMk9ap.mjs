import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/xmnn/epaper.ts
const route = {
	path: "/epaper/:id?",
	categories: ["traditional-media"],
	example: "/xmnn/epaper/xmrb",
	parameters: { id: "报纸 id，见下表，默认为 `xmrb`，即厦门日报" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["epaper.xmnn.cn/:id"],
		target: "/epaper/:id"
	}],
	name: "数字媒体",
	maintainers: ["nczitzk"],
	handler,
	description: `| 厦门日报 | 厦门晚报 | 海西晨报 | 城市捷报 |
| -------- | -------- | -------- | -------- |
| xmrb     | xmwb     | hxcb     | csjb     |`
};
async function handler(ctx) {
	const id = ctx.req.param("id") ?? "xmrb";
	let currentUrl = `https://epaper.xmnn.cn/${id === "hxcb" ? "/hxcb/epaper/paperindex.htm" : `${id}/`}`;
	let response = await got_default({
		method: "get",
		url: currentUrl
	});
	let $ = load(response.data);
	const title = id === "hxcb" ? "海西晨报电子版_厦门网" : $("title").text();
	let matches = response.data.match(/window\.location\.href = "(.*?)";/);
	if (!matches) {
		matches = response.data.match(/setTimeout\("javascript:location\.href='(.*?)'", 3000\);/);
		if (!matches) matches = response.data.match(/<meta http-equiv="refresh".*?content=".*?url=(.*?)">/i);
	}
	currentUrl = new URL(matches[1], currentUrl).href;
	response = await got_default({
		method: "get",
		url: currentUrl
	});
	$ = load(response.data);
	$("#pdfsrc").remove();
	$(".bigImg, .smallImg").remove();
	$("a img").each((_, el) => {
		$(el).parent().remove();
	});
	let items = $(".br1, .br2, .titss").find("a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 80).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: new URL(item.attr("href"), currentUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content("#qw").remove();
		item.description = content(".cont-b, content").html();
		item.pubDate = timezone(parseDate(content(".time").text() || content(".today").text().split()[0], ["YYYY-MM-DD HH:mm", "YYYY年MM月DD日"]), 8);
		return item;
	})));
	return {
		title,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
