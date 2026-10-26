import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/vocus/utils.ts
const baseUrl = "https://vocus.cc";
const apiUrl = "https://api.vocus.cc";
const processList = (articleData) => articleData.map((item) => ({
	title: item.title,
	description: item.abstract,
	pubDate: parseDate(item.createdAt),
	link: `${baseUrl}/article/${item._id}`,
	author: item.user.fullname,
	_id: item._id
}));
const ProcessFeed = (list) => Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
	const { data: { article } } = await got_default(`${apiUrl}/api/article/${item._id}`, { headers: { referer: item.link } });
	const $ = load(article.content, null, false);
	$("div.draft--imgNormal").each((_, elem) => elem.name = "figure");
	$(".image-block-prerender").each((_, elem) => {
		elem.name = "img";
		elem.attribs.src = elem.attribs["data-src"].split("?", 1)[0];
	});
	item.description = $.html();
	item.category = article.tags?.map((tag) => tag.title);
	return item;
})));
//#endregion
export { processList as i, apiUrl as n, baseUrl as r, ProcessFeed as t };
