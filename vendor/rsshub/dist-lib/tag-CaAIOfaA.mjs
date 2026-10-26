import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ithome/tag.ts
const rootUrl = "https://www.ithome.com/";
const route = {
	path: "/tag/:name",
	categories: ["new-media"],
	example: "/ithome/tag/win11",
	parameters: { name: "标签名称，可从网址链接中获取" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ithome.com/tag/:name"] }],
	name: "标签",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const url = `${rootUrl}tag/${name}`;
	const $ = load((await got_default(url)).data);
	const list = $("ul.bl > li").toArray().map((item) => ({
		title: $(item).find("h2 > a").text(),
		link: $(item).find("h2 > a").attr("href"),
		pubDate: timezone(parseDate($(item).find("div.c").attr("data-ot")), 8)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		let detailResponse;
		try {
			detailResponse = await got_default(item.link);
		} catch {}
		if (!detailResponse) return;
		const content = load(detailResponse.data);
		const article = content("div.post_content");
		article.find("img[data-original]").each((_, ele) => {
			ele = $(ele);
			ele.attr("src", ele.attr("data-original"));
			ele.removeAttr("class");
			ele.removeAttr("data-original");
		});
		item.description = article.html();
		item.author = content("span.author_baidu > strong").text();
		return item;
	})));
	return {
		title: `IT之家 - ${name}标签`,
		link: url,
		item: items.filter(Boolean)
	};
}
//#endregion
export { route };
