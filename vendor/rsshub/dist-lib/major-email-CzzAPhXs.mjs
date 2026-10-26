import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/gov/hunan/changsha/major-email.ts
const baseUrl = "http://wlwz.changsha.gov.cn";
const route = {
	path: "/changsha/major-email",
	categories: ["government"],
	example: "/gov/hunan/changsha/major-email",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["wlwz.changsha.gov.cn/webapp/cs2020/email/*"] }],
	name: "长沙市人民政府 市长信箱",
	maintainers: ["shansing"],
	handler,
	url: "wlwz.changsha.gov.cn/webapp/cs2020/email/*",
	description: "可能仅限中国大陆服务器访问，以实际情况为准。"
};
async function handler() {
	const listPage = await got_default("http://wlwz.changsha.gov.cn/webapp/cs2020/email/index.jsp", { responseType: "buffer" });
	listPage.data = iconv.decode(listPage.data, "gbk");
	const $ = load(listPage.data);
	const list = $(".table1 tbody tr").slice(1).toArray().map((tr) => {
		tr = $(tr);
		return {
			title: tr.find("td[title]").attr("title"),
			link: baseUrl + tr.find("td[title] > a").attr("href"),
			author: tr.find("td:last").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const postPage = await got_default(item.link, { responseType: "buffer" });
		postPage.data = iconv.decode(postPage.data, "gbk");
		const $ = load(postPage.data);
		return {
			title: item.title,
			description: $(".letter-details").html().trim(),
			pubDate: parseDate($(".letter-details div:first table tr:nth-child(2) > .td_label2").text() + " +0800", "YYYY-MM-DD HH:mm:ss ZZ"),
			link: item.link,
			author: item.author
		};
	})));
	return {
		title: "来信反馈 - 长沙市市长信箱",
		link: `${baseUrl}/webapp/cs2020/email/index.jsp`,
		item: items
	};
}
//#endregion
export { route };
