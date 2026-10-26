import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as appsUrl } from "./utils-DDi1zjra.mjs";
import { t as renderComment } from "./comment-BzgybzNW.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/apps/comment.ts
const route = {
	path: "/apps/:lang?/comment/:id",
	categories: ["anime"],
	example: "/qoo-app/apps/en/comment/7675",
	parameters: {
		lang: "Language, see the table below, empty means `中文`",
		id: "Game ID, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Game Store - Review",
	maintainers: ["TonyRL"],
	handler,
	description: `| 中文 | English | 한국어 | Español | 日本語 | ไทย | Tiếng Việt |
| ---- | ------- | ------ | ------- | ------ | --- | ---------- |
|      | en      | ko     | es      | ja     | th  | vi         |`
};
async function handler(ctx) {
	const { id, lang = "" } = ctx.req.param();
	const link = `${appsUrl}${lang ? `/${lang}` : ""}/app-comment/${id}`;
	const { data: response } = await got_default(link, { searchParams: { sort: "create" } });
	const $ = load(response);
	const items = $(".qoo-post-item").toArray().map((item) => {
		item = $(item);
		const author = item.find(".qoo-clearfix .name a").eq(0).text();
		return {
			title: `${author} ▶ ${item.find(".qoo-clearfix .name a").eq(1).text()}`,
			link: item.find("a.bg-click-wrap").attr("href"),
			description: renderComment({
				rating: item.find(".qoo-rating-bar").text().trim(),
				text: item.find(".text-view").html()
			}),
			pubDate: timezone(parseDate(item.find("time").text(), "YYYY-MM-DD HH:mm:ss"), 8),
			author
		};
	});
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
