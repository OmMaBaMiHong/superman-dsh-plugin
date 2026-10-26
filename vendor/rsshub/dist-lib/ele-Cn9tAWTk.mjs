import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cau/ele.ts
const route = {
	path: "/ele",
	categories: ["university"],
	example: "/cau/ele",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["ciee.cau.edu.cn/col/col26712/index.html", "ciee.cau.edu.cn/"] }],
	name: "研招网通知公告",
	maintainers: ["shengmaosu"],
	handler,
	url: "ciee.cau.edu.cn/col/col26712/index.html",
	description: "#### 信电学院 {#zhong-guo-nong-ye-da-xue-yan-zhao-wang-tong-zhi-gong-gao-xin-dian-xue-yuan}"
};
async function handler() {
	const baseUrl = "https://ciee.cau.edu.cn";
	const link = `${baseUrl}/col/col26712/index.html`;
	const $ = load((await got_default(`${baseUrl}/module/web/jpage/dataproxy.jsp`, { searchParams: {
		page: 1,
		appid: 1,
		webid: 107,
		path: "/",
		columnid: 26712,
		unitid: 38467,
		webname: "信息与电气工程学院",
		permissiontype: 0
	} })).data);
	const list = $("recordset record");
	return {
		title: "中国农业大学信电学院",
		link,
		description: "中国农业大学信电学院通知公告",
		item: list && list.toArray().map((item) => {
			item = $(item);
			const a = item.find("a");
			const title = a.attr("title");
			const link = `${baseUrl}${a.attr("href")}`;
			return {
				title,
				link,
				pubDate: parseDate(item.find(".col-lg-1").text()),
				guid: `${link}#${title}`
			};
		})
	};
}
//#endregion
export { route };
