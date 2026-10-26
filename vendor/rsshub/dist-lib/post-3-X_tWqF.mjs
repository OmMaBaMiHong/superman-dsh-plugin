import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { i as newsUrl, r as fixImg, t as appsUrl } from "./utils-DDi1zjra.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/apps/post.ts
const route = {
	path: "/apps/:lang?/post/:id",
	categories: ["anime"],
	example: "/qoo-app/apps/en/post/7675",
	parameters: {
		lang: "Language, see the table above, empty means `中文`",
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
	name: "Game Store - Article",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { id, lang = "" } = ctx.req.param();
	const link = `${appsUrl}${lang ? `/${lang}` : ""}/app-post/${id}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".qoo-post-item").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.attr("title"),
			link: a.attr("href"),
			pubDate: timezone(parseDate(item.find("time").text(), "YYYY-MM-DD HH:mm"), 8),
			author: item.find("cite.name").text(),
			postId: a.attr("href").split("/").pop()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data } = await got_default(`${newsUrl}${lang ? `/${lang}` : ""}/wp-json/wp/v2/posts/${item.postId}`);
		const $ = load(data.content.rendered, null, false);
		fixImg($);
		item.description = $.html();
		item.pubDate = parseDate(data.date_gmt);
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
