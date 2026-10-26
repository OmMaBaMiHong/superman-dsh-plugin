import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
import iconv from "iconv-lite";
//#region lib/routes/tingshuitz/xian.ts
const route = {
	path: "/xian",
	categories: ["forecast"],
	example: "/tingshuitz/xian",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "西安市",
	maintainers: ["ciaranchen"],
	handler
};
async function handler() {
	const data = (await got_default("http://www.xazls.com/tsgg/index.htm", { responseType: "buffer" })).data;
	const $ = load(iconv.decode(data, "gb2312"));
	const list = $("#body > div.M > div.AboutUsDetail > ul > li");
	return {
		title: $("title").text() || "停水通知 - 西安市自来水有限公司",
		link: "http://www.xazls.com/tsgg/index.htm",
		item: list.toArray().map((el) => {
			const item = $(el);
			const a = item.find("a");
			return {
				title: a.text().trim(),
				description: item.text().trim(),
				link: "http://www.xazls.com" + a.attr("href")
			};
		})
	};
}
//#endregion
export { route };
