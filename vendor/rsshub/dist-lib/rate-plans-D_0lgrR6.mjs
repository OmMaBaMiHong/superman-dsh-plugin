import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/taiwanmobile/rate-plans.ts
const route = {
	path: "/rate-plans",
	categories: ["other"],
	example: "/taiwanmobile/rate-plans",
	radar: [{ source: ["taiwanmobile.com/cs/public/servAnn/queryList.htm"] }],
	name: "資費公告",
	maintainers: ["Tsuyumi25"],
	handler,
	url: "www.taiwanmobile.com/cs/public/servAnn/queryList.htm?type=1"
};
async function handler() {
	const baseUrl = "https://www.taiwanmobile.com";
	const listUrl = `${baseUrl}/cs/public/servAnn/queryList.htm?type=1`;
	const $ = load(await rofetch(listUrl));
	const list = $(".pagination_data").toArray().map((item) => {
		const element = $(item);
		return {
			title: element.find("a").text().trim(),
			link: new URL(element.find("a").attr("href") ?? "", baseUrl).href,
			pubDate: parseDate(element.find("td").first().text(), "YYYY/MM/DD")
		};
	}).slice(0, 20);
	return {
		title: "台灣大哥大 - 資費公告",
		link: listUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load(await rofetch(item.link));
			return {
				...item,
				description: content(".v2-page-change__current").find(".v2-uikit__typography-text.-h3, .v2-m-faq-card__description.gray.pad_btm1").remove().end().html() || "暫無內容"
			};
		})))
	};
}
//#endregion
export { route };
