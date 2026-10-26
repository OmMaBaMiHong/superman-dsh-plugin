import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cas/sim/kyjz.ts
const host = "http://www.sim.cas.cn/";
const route = {
	path: "/sim/kyjz",
	categories: ["university"],
	example: "/cas/sim/kyjz",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.sim.cas.cn/xwzx2016/kyjz", "www.sim.cas.cn/"] }],
	name: "上海微系统与信息技术研究所 科技进展",
	maintainers: ["HenryQW"],
	handler,
	url: "www.sim.cas.cn/xwzx2016/kyjz"
};
async function handler() {
	const link = new URL("xwzx2016/kyjz/", host).href;
	const $ = load((await got_default(link)).data);
	const list = $(".list-news li").toArray().filter((e) => !$(e).attr("style")).map((e) => {
		e = $(e);
		return {
			link: new URL(e.find("a").attr("href"), link).href,
			pubDate: e.find("span").text().replace("[", "").replace("]", "")
		};
	});
	return {
		title: "中国科学院上海微系统与信息技术研究所 -- 科技进展",
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			const author = $(".qtinfo.hidden-lg.hidden-md.hidden-sm").text();
			const reg = /文章来源：(.*?)\|/;
			item.title = $("p.wztitle").text().trim();
			item.author = reg.exec(author)[1].toString().trim();
			item.description = $(".TRS_Editor").html();
			item.pubDate = parseDate(item.pubDate);
			return item;
		})))
	};
}
//#endregion
export { route };
