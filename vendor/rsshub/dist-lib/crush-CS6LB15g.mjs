import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/crush/index.ts
const baseUrl = "https://www.crush.ninja";
const route = {
	path: "/pages/:id",
	name: "匿名投稿頁面",
	url: "www.crush.ninja",
	maintainers: ["Tsuyumi25"],
	example: "/crush/pages/141719909033861",
	parameters: { id: { description: "頁面 ID 或代稱，例如 `141719909033861` 或 `awkward87poland`" } },
	radar: [{
		source: ["www.crush.ninja/:locale/pages/:id"],
		target: "/pages/:id"
	}],
	handler
};
async function handler(ctx) {
	const { id } = ctx.req.param();
	const targetUrl = `${baseUrl}/en-us/pages/${id}/`;
	const $ = load(await rofetch(targetUrl));
	const title = $("meta[property=\"og:title\"]").attr("content") || `CrushNinja - ${id}`;
	const description = $("meta[name=\"description\"]").attr("content") ?? void 0;
	const image = $("meta[property=\"og:image\"]").attr("content") ?? void 0;
	return {
		title,
		description,
		link: targetUrl,
		item: $("div.rounded-border").toArray().map((el) => {
			const $el = $(el);
			const description = ($el.find(".p-1").first().text() || "").trim();
			return {
				title: description,
				description,
				pubDate: timezone(parseDate(($el.children("div").last().text() || "").trim().replace("Published at: ", "")), 0),
				guid: `${targetUrl}#${md5(description)}`
			};
		}),
		image,
		allowEmpty: true
	};
}
//#endregion
export { route };
