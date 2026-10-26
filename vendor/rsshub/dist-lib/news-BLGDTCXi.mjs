import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/panewslab/news.ts
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/panewslab/news",
	radar: [{ source: ["panewslab.com/"] }],
	name: "快讯",
	maintainers: ["nczitzk"],
	handler,
	url: "panewslab.com/"
};
async function handler(ctx) {
	const rootUrl = "https://panewslab.com";
	const apiUrl = `${rootUrl}/webapi/flashnews?LId=1&Rn=${ctx.req.query("limit") ?? 50}&tw=0`;
	return {
		title: "PANews - 快讯",
		link: `${rootUrl}/zh/news/index.html`,
		item: (await got_default({
			method: "get",
			url: apiUrl
		})).data.data.flashNews[0].list.map((item) => ({
			title: item.title,
			author: item.author.name,
			pubDate: parseDate(item.publishTime * 1e3),
			link: `${rootUrl}/zh/articledetails/${item.id}.html`,
			description: `<p>${item.desc.replaceAll("\r\n原文链接", "")}</p>`,
			category: item.tags
		}))
	};
}
//#endregion
export { route };
