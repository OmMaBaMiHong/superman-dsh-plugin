import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/mpaypass/main.ts
const route = {
	path: "/main/:type?",
	categories: ["new-media"],
	example: "/mpaypass/main/policy",
	parameters: { type: "新闻类型，类型可在URL中找到，类似`policy`，`eye`等，空或其他任意值展示最新新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "分类",
	maintainers: ["zhuan-zhu"],
	handler
};
async function handler(ctx) {
	const { type = "" } = ctx.req.param();
	const title_url = type ? `http://www.mpaypass.com.cn/${type}.html` : "http://www.mpaypass.com.cn";
	const data = (await got_default({
		method: "get",
		url: title_url
	})).data;
	const $ = load(data);
	const title_cn = type ? $(`a[href="http://www.mpaypass.com.cn/${type}.html"]`).text() : "最新文章";
	const list = $(".newslist").toArray().map((item) => {
		return {
			title: $(item).find("#title").text(),
			link: $(item).find("#title").find("a").attr("href"),
			time: $(item).find("#time").text(),
			category: $(item).find("#keywords").find("a").toArray().map((e) => $(e).text().trim())
		};
	});
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		const newsbody = load((await got_default(info.link)).data)("div.newsbody").html();
		return {
			title: info.title,
			link: info.link,
			pubDate: timezone(parseDate(info.time), 8),
			description: newsbody,
			category: info.category
		};
	})));
	return {
		title: `移动支付网-${title_cn}`,
		link: title_url,
		item: out
	};
}
//#endregion
export { route };
