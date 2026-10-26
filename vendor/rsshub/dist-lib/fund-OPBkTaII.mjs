import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/xueqiu/fund.ts
const route = {
	path: "/fund/:id",
	categories: ["finance"],
	example: "/xueqiu/fund/040008",
	parameters: { id: "基金代码, 可在基金主页 URL 中找到. 此路由的数据为场外基金 (`F`开头)" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "蛋卷基金净值更新",
	maintainers: ["HenryQW", "NathanDai"],
	handler
};
async function handler(ctx) {
	const guid = ctx.req.param("id");
	const appUrl = `https://danjuanapp.com/funding/${guid}`;
	const response = await got_default({
		method: "get",
		url: `https://danjuanapp.com/djapi/fund/${guid}`,
		headers: { Referer: appUrl }
	});
	const fd_full_name = response.data.data.fd_full_name;
	const fd_name = response.data.data.fd_name;
	const fd_code = response.data.data.fd_code;
	const unit_nav = response.data.data.fund_derived.unit_nav;
	const nav_grtd = response.data.data.fund_derived.nav_grtd;
	const end_date = response.data.data.fund_derived.end_date;
	let description = `基金代码 ${fd_code} <br> 今日净值(${end_date}) ¥${unit_nav} `;
	let title = fd_full_name;
	if (nav_grtd > 0) {
		description += `<br> 日涨跌 ${nav_grtd}%`;
		title += `📈 ${nav_grtd}%`;
	} else if (nav_grtd < 0) {
		description += `<br> 日跌跌 ${nav_grtd}%`;
		title += `📉 ${nav_grtd}%`;
	} else if (nav_grtd === "0.0000") {
		description += "无波动";
		title += "持平";
	}
	const single = {
		title,
		description,
		pubDate: timezone(parseDate(end_date), 8),
		link: appUrl
	};
	return {
		title: fd_name,
		link: appUrl,
		description,
		item: [single]
	};
}
//#endregion
export { route };
