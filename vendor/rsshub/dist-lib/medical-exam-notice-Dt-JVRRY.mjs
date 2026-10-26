import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/jinan/healthcommission/medical-exam-notice.ts
const route = {
	path: "/healthcommission/medical_exam_notice",
	categories: ["government"],
	example: "/gov/jinan/healthcommission/medical_exam_notice",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["jnmhc.jinan.gov.cn/*"] }],
	name: "获取国家医师资格考试通知",
	maintainers: ["tzjyxb"],
	handler,
	url: "jnmhc.jinan.gov.cn/*"
};
async function handler() {
	const baseUrl = "https://jnmhc.jinan.gov.cn";
	const $ = load((await got_default("https://jnmhc.jinan.gov.cn/module/web/jpage/dataproxy.jsp", { searchParams: {
		page: 1,
		webid: 28,
		path: "/",
		columnid: 14418,
		unitid: 18878,
		webname: "济南市卫生健康委员会",
		permissiontype: 0
	} })).data, { xmlMode: true });
	const list = $("record");
	return {
		title: "济南卫建委-执业考试通知",
		link: `${baseUrl}/col/col14418/index.html`,
		item: list.toArray().map((item) => {
			item = $(item).text();
			const html = load(item);
			const title = html("td[width=\"620\"] a").attr("title");
			const link = html("td[width=\"620\"] a").attr("href");
			return {
				title,
				description: title,
				pubDate: timezone(parseDate(html("td[width=\"100\"]").text()), 8),
				link,
				author: "济南市卫生健康委员会"
			};
		})
	};
}
//#endregion
export { route };
