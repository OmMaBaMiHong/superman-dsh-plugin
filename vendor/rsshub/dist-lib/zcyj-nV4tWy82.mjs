import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as processItems } from "./utils-CmrBSrlw.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/pbc/zcyj.ts
const host = "http://www.pbc.gov.cn";
const route = {
	path: "/zcyj",
	example: "/gov/pbc/zcyj",
	radar: [{ source: ["pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html"] }],
	name: "政策研究",
	maintainers: ["Fatpandac"],
	handler,
	url: "pbc.gov.cn/redianzhuanti/118742/4122386/4122510/index.html"
};
async function handler() {
	const url = `${host}/redianzhuanti/118742/4122386/4122510/index.html`;
	const $ = load((await got_default.post(url)).data);
	return {
		title: "中国人民银行 政策研究",
		link: url,
		item: await processItems($("li.clearfix").toArray().map((item) => ({
			title: $(item).find("a").text(),
			link: new URL($(item).find("a").attr("href"), host).href,
			pubDate: timezone(parseDate($(item).find("span.fr").text(), "YYYY-MM-DD"), 8)
		})))
	};
}
//#endregion
export { route };
