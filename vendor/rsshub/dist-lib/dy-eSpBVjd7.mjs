import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as parseDyArticle } from "./utils-CGdnqezn.mjs";
//#region lib/routes/163/dy.ts
const route = {
	path: "/dy/:id",
	categories: ["new-media"],
	example: "/163/dy/W4983108759592548559",
	parameters: { id: "网易号 ID" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "更新",
	maintainers: ["HendricksZheng"],
	handler,
	description: `1. 在[网易号搜索页面](https://dy.163.com/v2/media/tosearch.html) 搜索想要订阅的网易号。
2. 打开网易号的任意文章。
3. 查看源代码，搜索 \`data-wemediaid\`，查看紧随其后的引号内的属性值（类似 \`W1966190042455428950\`）即为网易号 ID。`
};
async function handler(ctx) {
	const list = (await got_default(`https://dy.163.com/v2/article/list.do?pageNo=1&wemediaId=${ctx.req.param("id")}&size=10`)).data.data.list.map((e) => ({
		title: e.title,
		link: "https://www.163.com/dy/article/" + e.docid + ".html",
		pubDate: timezone(parseDate(e.ptime), 8),
		author: e.source,
		imgsrc: e.imgsrc
	}));
	const items = await Promise.all(list.map((e) => parseDyArticle(e)));
	return {
		title: `网易号 - ${list[0].author}`,
		link: items[0].feedLink,
		description: items[0].feedDescription,
		image: items[0].feedImage,
		item: items
	};
}
//#endregion
export { route };
