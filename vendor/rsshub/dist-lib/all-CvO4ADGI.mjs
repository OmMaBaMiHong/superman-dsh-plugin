import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/cebbank/all.tsx
const route = {
	path: "/quotation/all",
	categories: ["other"],
	example: "/cebbank/quotation/all",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: [
		"cebbank.com/site/ygzx/whpj/index.html",
		"cebbank.com/eportal/ui",
		"cebbank.com/"
	] }],
	name: "Unknown",
	maintainers: ["linbuxiao"],
	handler,
	url: "cebbank.com/site/ygzx/whpj/index.html"
};
async function handler(ctx) {
	const link = "https://www.cebbank.com/eportal/ui?pageId=477257";
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const ret = {
		title: "中国光大银行",
		description: "中国光大银行 外汇牌价",
		link,
		item: $(".lczj_box tbody tr").toArray().map((e, i) => {
			if (i < 2) return null;
			const c = load(e, { decodeEntities: false });
			return {
				title: c("td:nth-child(1)").text(),
				description: renderToString(/* @__PURE__ */ jsx(CebbankRateDescription, {
					fcer: c("td:nth-child(2)").text(),
					pmc: c("td:nth-child(3)").text(),
					exrt: c("td:nth-child(4)").text(),
					mc: c("td:nth-child(5)").text()
				})),
				pubDate: timezone(parseDate($("#t_id span").text().slice(5), "YYYY-MM-DD HH:mm", true), 8),
				guid: md5(c("td:nth-child(1)").text() + $("#t_id span").text().slice(5))
			};
		})
	};
	const pubDate = parseDate($("#t_id span").text().slice(5), "YYYY-MM-DD HH:mm", true);
	ctx.set("json", {
		...ret,
		pubDate: timezone(pubDate, 0)
	});
	return ret;
}
const CebbankRateDescription = ({ fcer, pmc, exrt, mc }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs("p", { children: [
	"购汇：",
	fcer,
	"，购钞：",
	pmc
] }), /* @__PURE__ */ jsxs("p", { children: [
	"结汇: ",
	exrt,
	"，结钞：",
	mc
] })] });
//#endregion
export { route };
