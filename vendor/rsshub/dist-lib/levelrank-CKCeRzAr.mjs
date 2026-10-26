import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/air-level/levelrank.ts
const route = {
	path: "/rank/:status?",
	radar: [{
		source: ["m.air-level.com/rank/:status", "m.air-level.com/rank"],
		target: "/rank/:status"
	}],
	parameters: { status: "地区" },
	name: "空气质量排行",
	maintainers: ["lifetraveler"],
	example: "/air-level/rank/best,/air-level/rank",
	handler
};
async function handler(ctx) {
	const status = ctx.req.param("status");
	const currentUrl = "https://m.air-level.com/rank";
	const $ = load(await rofetch(currentUrl));
	let table = "";
	let title = "";
	const titleBest = $("body > div.container > div.row.page > div:nth-child(1) > div:nth-child(5) > h3").text().replaceAll("[]", "");
	const tableBest = $("body > div.container > div.row.page > div:nth-child(1) > div:nth-child(5) > table").html();
	const titleWorst = $("body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > h3").text().replaceAll("[]", "");
	const tableWorst = $("body > div.container > div.row.page > div:nth-child(1) > div:nth-child(3) > table").html();
	if (status) {
		if (status === "best") {
			title = titleBest;
			table = `<table border="1 solid black">${tableBest}</table>`;
		} else if (status === "worsest") {
			title = titleWorst;
			table = `<table border="1 solid black">${tableWorst}</table>`;
		}
	} else {
		title = $("body > div.container > div.row.page > div:nth-child(1) > h2").text().replaceAll("[]", "");
		table = `${titleBest}<br/><table border="1 solid black">${tableBest}</table><br/><table border="1 solid black">${titleWorst}<br/>${tableWorst}</table>`;
	}
	const pubtime = $("body > div.container > div.row.page > div:nth-child(1) > h4").text();
	return {
		title,
		item: [{
			title,
			link: currentUrl,
			description: table,
			guid: pubtime
		}],
		description: "空气质量排行",
		link: currentUrl
	};
}
//#endregion
export { route };
