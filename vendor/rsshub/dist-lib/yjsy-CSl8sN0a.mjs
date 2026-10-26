import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hljucm/yjsy.ts
const route = {
	path: "/yjsy/:category?",
	categories: ["university"],
	example: "/hljucm/yjsy",
	parameters: { category: "分类, 见下表，默认为新闻动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "研究生院",
	maintainers: ["nczitzk"],
	handler,
	description: `| 新闻动态 | 通知公告 |
| -------- | -------- |
| xwdt     | tzgg     |`
};
async function handler(ctx) {
	const currentUrl = `https://yjsy.hljucm.net/index/${ctx.req.param("category") ?? "xwdt"}.htm`;
	const $ = load((await got_default(currentUrl)).data);
	const list = $(".postlist a").toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: new URL(item.attr("href"), currentUrl).href
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link);
		const content = load(detailResponse.data);
		item.description = content("#vsb_newscontent").html();
		item.pubDate = timezone(parseDate(content(".timestyle56043").text()), 8);
		const files = detailResponse.data.match(/<span>附件【<a href="(.*)"><span>(.*)<\/span><\/a>】<\/span>/g);
		if (files) for (const file of files) {
			const { link, name } = file.match(/【<a href="(?<link>.*)"><span>(?<name>.*)<\/span><\/a>】/).groups;
			item.description += `<a href="${link}">${name}</a>`;
		}
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
