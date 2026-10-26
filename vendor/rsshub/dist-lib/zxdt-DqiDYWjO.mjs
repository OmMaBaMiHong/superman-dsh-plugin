import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/12306/zxdt.ts
const route = {
	path: "/zxdt/:id?",
	categories: ["travel"],
	example: "/12306/zxdt",
	parameters: { id: "铁路局id，可在 URL 中找到，不填默认显示所有铁路局动态" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.12306.cn/", "www.12306.cn/mormhweb/1/:id/index_fl.html"],
		target: "/zxdt/:id"
	}],
	name: "最新动态",
	maintainers: ["LogicJake"],
	handler,
	url: "www.12306.cn/"
};
async function handler(ctx) {
	const id = ctx.req.param("id") || -1;
	const link = id === -1 ? "https://www.12306.cn/mormhweb/zxdt/index_zxdt.html" : `https://www.12306.cn/mormhweb/1/${id}/index_fl.html`;
	const data = (await got_default.get(link)).data;
	const $ = load(data);
	const name = $("div.nav_center > a:nth-child(4)").text();
	const list = $("#newList > ul > li").toArray().map((item) => ({
		title: $(item).find("a").text(),
		link: new URL($(item).find("a").attr("href"), link).href,
		pubDate: parseDate($(item).find("span").text().slice(1, -1))
	}));
	const out = await Promise.all(list.map((info) => cache_default.tryGet(info.link, async () => {
		const $ = load((await got_default.get(info.link)).data);
		info.description = $(".article-box").html() || $(".content_text").html() || "文章已被删除";
		return info;
	})));
	return {
		title: `${name}最新动态`,
		link,
		item: out
	};
}
//#endregion
export { route };
