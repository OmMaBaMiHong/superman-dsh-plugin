import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/hainan/iitb/tzgg.ts
const route = {
	path: "/iitb/tzgg",
	categories: ["government"],
	example: "/gov/hainan/iitb/tzgg",
	url: "iitb.hainan.gov.cn/iitb/tzgg/list2.shtml",
	name: "通知公告",
	maintainers: ["p3psi-boo"],
	handler
};
async function handler() {
	const baseUrl = "https://iitb.hainan.gov.cn";
	const targetUrl = `${baseUrl}/iitb/tzgg/list2.shtml`;
	const $ = load((await got_default({
		method: "get",
		url: targetUrl
	})).data);
	const list = $(".list_div").toArray().map((item) => {
		const elem = $(item);
		const titleElement = elem.find(".list-right_title a");
		const link = titleElement.attr("href") || "";
		const title = titleElement.text().trim() || "";
		const dateText = elem.find("td[align=\"left\"]").text().replace("发布时间：", "").trim();
		const department = elem.find(".column-name").text().trim();
		return {
			title,
			link: new URL(link, baseUrl).href,
			pubDate: parseDate(dateText),
			category: department
		};
	});
	return {
		title: "通知公告 - 海南省工业和信息化厅",
		link: targetUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const author = $("#xxgkfbjg").text();
			const pubDate = $("publishtime").text();
			const content = $("ucapcontent").html();
			item.author = author;
			item.pubDate = parseDate(pubDate);
			item.description = content;
			return item;
		})))
	};
}
//#endregion
export { route };
