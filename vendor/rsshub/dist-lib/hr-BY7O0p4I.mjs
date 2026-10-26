import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/uibe/hr.ts
const route = {
	path: "/hr/:category?/:type?",
	categories: ["university"],
	example: "/uibe/hr",
	parameters: {
		category: "分类，可在对应页 URL 中找到，默认为通知公告",
		type: "类型，可在对应页 URL 中找到，默认为空"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"hr.uibe.edu.cn/:category/:type",
		"hr.uibe.edu.cn/:category",
		"hr.uibe.edu.cn/"
	] }],
	name: "人力资源处",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
如 [通知公告](http://hr.uibe.edu.cn/tzgg) 的 URL 为 \`http://hr.uibe.edu.cn/tzgg\`，其路由为 [\`/uibe/hr/tzgg\`](https://rsshub.app/uibe/hr/tzgg)

如 [教师招聘](http://hr.uibe.edu.cn/jszp) 中的 [招聘信息](http://hr.uibe.edu.cn/jszp/zpxx) 的 URL 为 \`http://hr.uibe.edu.cn/jszp/zpxx\`，其路由为 [\`/uibe/hr/jszp/zpxx\`](https://rsshub.app/uibe/jszp/zpxx)
:::`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "tzgg";
	const type = ctx.req.param("type") ?? "";
	const currentUrl = `http://hr.uibe.edu.cn/${category}${type ? `/${type}` : ""}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".lawul, .longul").find("li a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("p").text(),
			link: `${currentUrl}/${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.description = content(".gp-article").html();
			item.pubDate = parseDate(content("#shareTitle").next().text().replace("时间：", ""));
		} catch {
			item.description = "Not Found";
		}
		return item;
	})));
	return {
		title: `${$(".picTit").text()} - 对外经济贸易大学人力资源处`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
