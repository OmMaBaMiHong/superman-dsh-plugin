import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/163/today.ts
const route = {
	path: "/today/:need_content?",
	categories: ["new-media"],
	example: "/163/today",
	parameters: { need_content: "需要获取全文，填写 true/yes 表示需要，默认需要" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["wp.m.163.com/163/html/newsapp/todayFocus/index.html", "wp.m.163.com/"],
		target: "/today"
	}],
	name: "今日关注",
	maintainers: ["nczitzk"],
	handler,
	url: "wp.m.163.com/163/html/newsapp/todayFocus/index.html",
	description: `::: tip
参数 **需要获取全文** 设置为 \`true\` \`yes\` \`t\` \`y\` 等值后，RSS 会携带该新闻条目的对应全文。
:::`
};
async function handler(ctx) {
	const needContent = /t|y/i.test(ctx.req.param("need_content") ?? "true");
	let items = (await got_default({
		method: "get",
		url: `https://gw.m.163.com/nc/api/v1/feed/static/normal-list?start=0&tid=T1573700340788&size=${ctx.req.query("limit") ?? (needContent ? 30 : 200)}`
	})).data.data.items.map((item) => ({
		title: item.title,
		author: item.source,
		pubDate: timezone(parseDate(item.ptime), 8),
		description: `<p>${item.digest}</p><img src="${item.imgsrc}">`,
		link: item.url || `https://c.m.163.com/news/a/${item.docid}.html`
	}));
	if (needContent) items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".bot_word").remove();
		content("img").each((_, img) => {
			img.attribs.src = img.attribs["data-src"] ?? img.attribs.src;
		});
		item.description = content(".content, article").html();
		return item;
	})));
	return {
		title: "今日关注 - 网易新闻",
		link: "https://wp.m.163.com/163/html/newsapp/todayFocus/index.html",
		item: items
	};
}
//#endregion
export { route };
