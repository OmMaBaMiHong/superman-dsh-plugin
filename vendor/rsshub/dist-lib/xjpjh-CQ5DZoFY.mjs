import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/people/xjpjh.ts
const host = "http://jhsjk.people.cn";
const route = {
	path: "/xjpjh/:keyword?/:year?",
	categories: ["traditional-media"],
	example: "/people/xjpjh",
	parameters: {
		keyword: "关键词，默认不填",
		year: "年份，默认 all"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["people.com.cn/"],
		target: "/:site?/:category?"
	}],
	name: "习近平系列重要讲话",
	maintainers: [],
	handler,
	url: "people.com.cn/"
};
async function handler(ctx) {
	let keyword = ctx.req.param("keyword") || "all";
	let year = ctx.req.param("year") || 0;
	let title = "习近平系列重要讲话";
	title = title + "-" + keyword;
	if (keyword === "all") keyword = "";
	if (year === 0) title += "-all";
	else {
		title = title + "-" + year;
		year -= 1811;
	}
	const link = `http://jhsjk.people.cn/result?keywords=${keyword}&year=${year}`;
	const $ = load((await got_default.get(link)).data);
	const list = $("ul.list_14.p1_2.clearfix li").slice(0, 10).toArray().map((element) => {
		return {
			title: $(element).find("a").text(),
			link: $(element).find("a").attr("href")
		};
	});
	const out = await Promise.all(list.map(async (info) => {
		const title = info.title;
		const itemUrl = new URL(info.link, host).href;
		const cacheIn = await cache_default.get(itemUrl);
		if (cacheIn) return JSON.parse(cacheIn);
		const single = {
			title,
			link: itemUrl,
			description: load((await got_default.get(itemUrl)).data)("div.d2txt_con.clearfix").html().trim()
		};
		cache_default.set(itemUrl, JSON.stringify(single));
		return single;
	}));
	return {
		title,
		link,
		item: out
	};
}
//#endregion
export { route };
