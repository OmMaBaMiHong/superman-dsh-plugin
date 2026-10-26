import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/itc/collection.ts
const RESULT_DESC_MAP = {
	[0]: "OpenGithub - Github开源项目精选 - 精选文章",
	[1]: "OpenGithub - Github开源项目精选 - 专栏",
	[2]: "OpenGithub - Github开源项目精选 - 周刊",
	[3]: "OpenGithub - Github开源项目精选 - 月刊"
};
const route = {
	path: "/collection/:colType",
	categories: ["blog"],
	example: "/itc/collection/1",
	radar: [{ source: ["open.itc.cn/"] }],
	name: "合集",
	maintainers: ["cnkmmk"],
	handler
};
async function handler(ctx) {
	const url = "https://open.itc.cn";
	const colType = ctx.req.param("colType");
	const result = {
		title: RESULT_DESC_MAP[colType] ?? "NULL",
		link: url,
		description: RESULT_DESC_MAP[colType] ?? "NULL",
		item: []
	};
	const $ = load(await rofetch(`${url}/github/collection/list?colType=${colType}`));
	result.item = [...$(".tab-pane > .row > .card")].map((item) => {
		const date = $(item).find(".d-flex.mt-3.ms-sm-auto").text()?.split(":", 2)?.[1];
		const dataObject = date ? new Date(date) : void 0;
		return {
			title: $(item).find("a.btn-link").text(),
			description: $(item).find(".d-sm-inline-block").text(),
			link: $(item).find("a.btn-link").attr("href") || "",
			pubDate: dataObject,
			category: [...$(item).find(".nav.nav-stack.small li")].map((sub) => $(sub).find(".badge").text())
		};
	});
	return result;
}
//#endregion
export { route };
