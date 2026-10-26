import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/csrc/auditstatus.ts
const route = {
	path: "/auditstatus/:apply_id",
	categories: ["government"],
	example: "/gov/csrc/auditstatus/9ce91cf2d750ee62de27fbbcb05fa483",
	parameters: { apply_id: "事项类别id，`https://neris.csrc.gov.cn/alappl/home/xkDetail` 列表中各地址的 appMatrCde 参数" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "申请事项进度",
	maintainers: ["hillerliao"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://neris.csrc.gov.cn";
	const { apply_id } = ctx.req.param();
	const res = await got_default(`${baseUrl}/alappl/home1/onlinealog`, { searchParams: { appMatrCde: apply_id } });
	const $ = load(res.data);
	const out = $("tr[height=\"50\"]").toArray().map((item) => {
		item = $(item);
		const itemTitle = item.find("li.templateTip").text();
		const audit_status_td = item.find("td[style=\"font-weight:100 ;color: black ;position: relative;left:20px\"]");
		const audit_status = audit_status_td.eq(-1).text();
		const title = "【" + audit_status + "】" + itemTitle;
		const audit_date = audit_status_td.eq(-1).next("td").text();
		let audit_desc = "";
		if (audit_status_td.length > 1) for (let i = 0; i < audit_status_td.length; i++) audit_desc += audit_status_td.eq(i).next("td").text() + "，" + audit_status_td.eq(i).text() + "；";
		else audit_desc = audit_date + "，" + audit_status;
		const description = itemTitle + "：" + audit_desc;
		return {
			title,
			description,
			pubDate: timezone(parseDate(audit_date), 8),
			link: res.url,
			guid: `${res.url}#${md5(description)}`
		};
	});
	return {
		title: `${$(".zx2 div").attr("title")} - 申请事项进度查询 - 中国证监会`,
		link: res.url,
		item: out
	};
}
//#endregion
export { route };
