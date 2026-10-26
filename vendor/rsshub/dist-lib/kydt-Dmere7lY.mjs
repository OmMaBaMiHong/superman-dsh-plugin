import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/cas/iee/kydt.ts
const route = {
	path: "/iee/kydt",
	categories: ["university"],
	example: "/cas/iee/kydt",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.iee.cas.cn/xwzx/kydt", "www.iee.cas.cn/"] }],
	name: "电工研究所 科研动态",
	maintainers: ["nczitzk"],
	handler,
	url: "www.iee.cas.cn/xwzx/kydt"
};
async function handler() {
	const rootUrl = "http://www.iee.cas.cn/xwzx/kydt/";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const list = $("li.entry .entry-content-title").slice(0, 15).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: a.attr("href")
		};
	});
	return {
		title: "科研成果 - 中国科学院电工研究所",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			item.description = content(".article-content").html();
			item.pubDate = timezone(parseDate(content("time").text().split("：", 2)[1]), 8);
			return item;
		})))
	};
}
//#endregion
export { route };
