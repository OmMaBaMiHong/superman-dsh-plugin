import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ouc/jwgl.ts
const route = {
	path: "/jwgl",
	categories: ["university"],
	example: "/ouc/jwgl",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jwgl.ouc.edu.cn/cas/login.action", "jwgl.ouc.edu.cn/public/SchoolNotice.jsp"] }],
	name: "选课信息教务通知",
	maintainers: ["3401797899"],
	handler,
	url: "jwgl.ouc.edu.cn/cas/login.action",
	description: `::: warning
由于选课通知仅允许校园网访问，需自行部署。
:::`
};
async function handler() {
	const link = "http://jwgl.ouc.edu.cn/public/listSchoolNotices.action?currentPage=1&recordsPerPage=15&qtitle=";
	const $ = load((await got_default(link)).data);
	const list = $("div.datalist table tbody tr").toArray().map((e) => {
		e = $(e);
		const noticeId = e.find("a").attr("onclick").match(/viewNotice\('(.+?)'\)/)[1];
		const tds = e.find("td");
		return {
			title: tds.eq(2).text(),
			link: "http://jwgl.ouc.edu.cn/public/viewSchoolNoticeDetail.action?schoolNoticeId=" + noticeId,
			pubDate: parseDate(tds.eq(3).text(), "YYYY-MM-DD HH:mm")
		};
	});
	return {
		title: "中国海洋大学选课信息教务通知",
		link,
		description: "中国海洋大学选课信息教务通知",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			item.description = load((await got_default(item.link)).data)("div.notice").html();
			return item;
		})))
	};
}
//#endregion
export { route };
