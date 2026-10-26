import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as processItems } from "./utils-CmrBSrlw.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/pbc/gzlw.ts
const host = "http://www.pbc.gov.cn";
const route = {
	path: "/gzlw",
	categories: ["finance"],
	example: "/gov/pbc/gzlw",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html"] }],
	name: "工作论文",
	maintainers: ["Fatpandac"],
	handler,
	url: "pbc.gov.cn/redianzhuanti/118742/4122386/4122692/index.html"
};
async function handler() {
	const url = `${host}/redianzhuanti/118742/4122386/4122692/index.html`;
	const $ = load((await got_default.post(url)).data);
	return {
		title: "中国人民银行 工作论文",
		link: url,
		item: await processItems($("li.clearfix").toArray().map((item) => ({
			title: $(item).find("a").text(),
			link: new URL($(item).find("a").attr("href"), host).href,
			author: $(item).find("span.fr").text().replaceAll("…", "")
		})))
	};
}
//#endregion
export { route };
