import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/qiyoujiage/price.ts
const route = {
	path: "/:path{.+}",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const link = `http://www.qiyoujiage.com/${ctx.req.param("path")}.shtml`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const priceText = $("#youjia").text();
	const item = [{
		title: priceText,
		description: $("#youjia").html(),
		link,
		guid: `${link}#${md5(priceText)}`
	}];
	return {
		title: $("title").text(),
		description: $("meta[name=\"Description\"]").attr("content"),
		link,
		item
	};
}
//#endregion
export { route };
