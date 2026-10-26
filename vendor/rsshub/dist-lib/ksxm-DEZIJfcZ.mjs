import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import iconv from "iconv-lite";
//#region lib/routes/gov/sh/rsj/ksxm.tsx
const rootUrl = "http://www.rsj.sh.gov.cn";
const renderDescription = ({ name, type, date, registrationDeadline }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsxs("text", { children: [
		"考试项目名称：",
		name,
		" "
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: [
		"考试类别：",
		type,
		" "
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: [
		"考试日期：",
		date,
		" "
	] }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsxs("text", { children: [
		"报名起止日期：",
		registrationDeadline,
		" "
	] })
] }));
const route = {
	path: "/rsj/ksxm",
	categories: ["government"],
	example: "/gov/sh/rsj/ksxm",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["rsj.sh.gov.cn/"] }],
	name: "职业能力考试院 考试项目",
	maintainers: ["Fatpandac"],
	handler,
	url: "rsj.sh.gov.cn/"
};
async function handler() {
	const url = `${rootUrl}/ksyzc/wangz/kwaplist_300.jsp`;
	const response = await got_default({
		method: "get",
		url,
		responseType: "buffer"
	});
	const $ = load(iconv.decode(response.data, "gbk"));
	return {
		title: "上海市职业能力考试院 - 考试项目",
		link: url,
		item: $("kwap").toArray().map((item) => ({
			title: $(item).find("kaosxmmc").text(),
			link: "http://www.rsj.sh.gov.cn/ksyzc/index801.jsp",
			description: renderDescription({
				name: $(item).find("kaosxmmc").text(),
				type: $(item).find("kaoslb_dmfy").text(),
				date: $(item).find("kaosrq").text(),
				registrationDeadline: $(item).find("baomksrq_A300").text()
			}),
			guid: `${$(item).find("kaosrq").text()}${$(item).find("kaosxmmc").text()}`
		}))
	};
}
//#endregion
export { route };
