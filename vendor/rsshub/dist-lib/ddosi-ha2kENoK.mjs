import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ddosi/index.ts
const route = {
	path: "/",
	example: "/ddosi",
	radar: [{
		source: ["ddosi.org/"],
		target: ""
	}],
	name: "首页",
	maintainers: ["XinRoom"],
	handler,
	url: "ddosi.org/"
};
async function handler() {
	const url = "https://www.ddosi.org/";
	const $ = load((await got_default({
		method: "get",
		url,
		headers: { Referer: url },
		headerGeneratorOptions: PRESETS.MODERN_IOS
	})).data);
	return {
		title: "雨苁",
		link: url,
		item: $("main>article").toArray().map((i) => {
			const item = $(i);
			const href = item.find("a:first-child").attr("href");
			const title = item.find(".entry-title a").text();
			const description = item.find(".entry-content p").text();
			const date = parseDate(item.find(".meta-date a time").attr("datetime"));
			return {
				title: String(title),
				description: String(description),
				pubDate: date,
				link: String(href)
			};
		})
	};
}
//#endregion
export { route };
