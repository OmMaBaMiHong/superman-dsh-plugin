import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hko/earthquake.ts
const route = {
	path: "/earthquake",
	name: "全球地震資訊網",
	maintainers: ["after9"],
	handler,
	example: "/hko/earthquake",
	categories: ["forecast"],
	description: "来自香港天文台的全球 5 级以上地震记录"
};
async function handler() {
	const title = "来自香港天文台的全球5级以上地震记录";
	const link = "https://www.hko.gov.hk/tc/gts/equake/quake-info.htm";
	const description = "提供經天文台分析的全球5.0級或以上及本地有感的地震資訊。";
	const $ = load(await rofetch("https://www.hko.gov.hk/gts/QEM/eq_app-30d_uc.xml", { headers: { accept: "application/xml" } }));
	return {
		title,
		link,
		description,
		item: $("Earthquake > EventGroup > Event").toArray().map((item) => {
			item = $(item);
			const degree = item.find("Mag").text();
			const city = item.find("City").text();
			const citystring = item.find("citystring").text();
			const hktDate = item.find("HKTDate").text();
			const hktTime = item.find("HKTTime").text();
			const latAndLon = "經緯:[" + item.find("Lat").text() + "," + item.find("Lon").text() + "]";
			return {
				title: `[震級:${degree}] [地點:${city}]`,
				description: `${citystring}, ${latAndLon}`,
				pubDate: timezone(parseDate(hktDate + hktTime, "YYYYMMDDHHmm"), 8)
			};
		})
	};
}
//#endregion
export { route };
