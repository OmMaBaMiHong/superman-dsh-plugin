import { n as parseRelativeDate, t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/aijishu/utils.ts
const parseArticle = (item) => {
	const articleUrl = `https://aijishu.com${item.url || item.object.url}`;
	return cache_default.tryGet(articleUrl, async () => {
		const d1 = parseDate(item.createdDate, ["YYYY-MM-DD", "M-DD"]);
		const d2 = parseRelativeDate(item.createdDate);
		let resp, desc;
		try {
			resp = await got_default(articleUrl);
			desc = load(resp.data)("article.fmt").html();
		} catch (error) {
			if (error.response.status === 403) {} else throw error;
		}
		return {
			title: item.title || item.object.title,
			link: articleUrl,
			description: desc,
			pubDate: d1.toString() === "Invalid Date" ? d2 : d1
		};
	});
};
var utils_default = { parseArticle };
//#endregion
//#region lib/routes/aijishu/index.ts
const route = {
	path: "/:type/:name?",
	categories: ["programming"],
	example: "/aijishu/channel/ai",
	parameters: {
		type: "文章类型，可以取值如下",
		name: "名字，取自URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "频道、专栏、用户",
	maintainers: [],
	handler,
	description: `| type    | 说明 |
| ------- | ---- |
| channel | 频道 |
| blog    | 专栏 |
| u       | 用户 |`
};
async function handler(ctx) {
	const { type, name = "newest" } = ctx.req.param();
	const u = name === "newest" ? "https://aijishu.com/" : `https://aijishu.com/${type}/${name}`;
	const $ = load((await got_default(u)).data);
	const title = $("title").text();
	const list = (await got_default(`https://aijishu.com${$("li[data-js-stream-load-more]").attr("data-api-url")}?page=1`)).data.data.rows;
	const items = await Promise.all(list.filter((item) => item?.url?.startsWith("/a/") || item?.object?.url.startsWith("/a/")).map((item) => utils_default.parseArticle(item)));
	return {
		title: title.split(" - ").slice(0, 2).join(" - "),
		link: u,
		item: items
	};
}
//#endregion
export { route };
