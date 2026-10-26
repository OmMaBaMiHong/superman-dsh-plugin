import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
//#region lib/routes/cneb/yjxx.ts
const route = {
	path: "/yjxx/*",
	radar: [{
		source: ["cneb.gov.cn/yjxx", "cneb.gov.cn/"],
		target: "/yjxx"
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "cneb.gov.cn/yjxx"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 200;
	const options = decodeURI(getSubPath(ctx)).replace(/\/yjxx/, "").split("/");
	options.shift();
	const level = options.find((o) => /.*色$/.test(o)) ?? "";
	const locations = options.filter((o) => !/.*色$/.test(o)).slice(0, 2);
	const rootUrl = "http://www.cneb.gov.cn";
	const apiRootUrl = "https://gdapi.cnr.cn";
	const currentUrl = `${rootUrl}/yjxx`;
	const apiUrl = `${apiRootUrl}/yjwnews`;
	const title = `${locations.join("")}${level}`;
	const items = (await got_default({
		method: "post",
		url: apiUrl,
		json: {
			size: limit,
			level: level ? `${level}预警` : "",
			province: locations.shift(),
			city: locations.shift()
		}
	})).data.datas.map((item) => ({
		title: item.doctitle,
		link: item.docpuburl,
		author: item.chnlname,
		description: item.doccontent,
		pubDate: timezone(parseDate(item.docpubtime), 8)
	}));
	return {
		title: `国家应急广播 - ${title}预警信息`,
		link: currentUrl,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
