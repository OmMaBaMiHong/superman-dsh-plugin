import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/163/renjian.ts
const titles = {
	texie: "特写",
	jishi: "记事",
	daxie: "大写",
	haodu: "好读",
	kanke: "看客"
};
const route = {
	path: "/renjian/:category?",
	categories: ["new-media"],
	example: "/163/renjian/texie",
	parameters: { category: "分类，见下表，默认为特写" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["renjian.163.com/:category", "renjian.163.com/"] }],
	name: "人间",
	maintainers: ["nczitzk"],
	handler,
	description: `| 特写  | 记事  | 大写  | 好读  | 看客  |
| ----- | ----- | ----- | ----- | ----- |
| texie | jishi | daxie | haodu | kanke |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "texie";
	const currentUrl = `https://renjian.163.com/special/renjian_${category}/`;
	const response = await got_default({
		method: "get",
		url: currentUrl,
		responseType: "buffer"
	});
	const data = iconv.decode(response.data, "gbk");
	let items;
	const urls = data.match(/url:"(.*)",/g);
	if (urls) items = urls.slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).map((item) => ({ link: item.match(/url:"(.*)",/)[1] }));
	else {
		const $ = load(data);
		items = $(".article h3 a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50).toArray().map((_, item) => {
			item = $(item);
			return { link: item.attr("href") };
		});
	}
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.title = content("h1").text();
		item.author = content("script").text().match(/renjian_author = '(.*)'/)[1];
		item.description = content("#endText").html() ?? content("#content").html();
		item.pubDate = timezone(parseDate(content(".pub_time").text() ?? content(".post_info").text().split("来源:", 1)[0].trim()), 8);
		return item;
	})));
	return {
		title: `人间 - ${titles[category]} - 网易新闻`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
