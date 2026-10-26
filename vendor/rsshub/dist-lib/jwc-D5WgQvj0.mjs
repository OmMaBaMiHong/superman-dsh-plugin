import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/buct/jwc.ts
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/buct/jwc",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jiaowuchu.buct.edu.cn/610/list.htm", "jiaowuchu.buct.edu.cn/611/main.htm"],
		target: "/jwc"
	}],
	name: "教务处",
	maintainers: ["Epic-Creeper"],
	handler,
	url: "buct.edu.cn/"
};
async function handler() {
	const rootUrl = "https://jiaowuchu.buct.edu.cn";
	const currentUrl = `${rootUrl}/610/list.htm`;
	const $ = load((await got_default.get(currentUrl)).data);
	const list = $("div.list02 ul > li").not("#wp_paging_w66 li").toArray().map((item) => ({
		pubDate: $(item).find("span").text(),
		title: $(item).find("a").attr("title"),
		link: `${rootUrl}${$(item).find("a").attr("href")}`
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default.get(item.link)).data);
		const iframeSrc = content(".wp_pdf_player").attr("pdfsrc");
		if (iframeSrc) {
			const pdfUrl = `${rootUrl}${iframeSrc}`;
			item.description = `此页面为PDF文档：<a href="${new URL(pdfUrl, rootUrl)}">点击查看pdf</a>`;
			return item;
		}
		item.description = content(".rt_zhengwen").html();
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
