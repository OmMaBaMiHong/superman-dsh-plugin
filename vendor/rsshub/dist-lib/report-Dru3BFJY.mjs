import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tokeninsight/report.ts
const baseURL = "https://www.tokeninsight.com/";
const title = "TokenInsight";
const link = "https://www.tokeninsight.com/";
const route = {
	path: "/report/:lang?",
	categories: ["finance"],
	example: "/tokeninsight/report/en",
	parameters: { lang: "Language, see below, Chinese by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["tokeninsight.com/:lang/report"],
		target: "/report/:lang"
	}],
	name: "Research",
	maintainers: [],
	handler,
	description: `Language:

| Chinese | English |
| ------- | ------- |
| zh      | en      |`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	const getReports = async () => {
		const url = `${baseURL}api/user/search/getAllList`;
		return (await got_default.post(url, { form: {
			isRecommend: 2,
			language: lang === "zh" ? "cn" : lang
		} })).data.data.reportList;
	};
	const getReportInfomation = async (report) => {
		const { publishDate, title, id } = report;
		const reportUrl = `${baseURL}${lang}/report/${id}`;
		return {
			title,
			description: await cache_default.tryGet(reportUrl, async () => {
				return load((await got_default(reportUrl)).data)(".detail_html_box").html();
			}),
			pubDate: parseDate(publishDate),
			link: reportUrl
		};
	};
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30;
	const reports = (await getReports()).slice(0, limit);
	const list = await Promise.all(reports.map((element) => getReportInfomation(element)));
	return {
		title: `${lang === "zh" ? "报告" : "Research"} | ${title}`,
		link: `${link}${lang}/report`,
		item: list
	};
}
//#endregion
export { route };
