import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/storyfm/index.ts
const route = {
	path: "/index",
	categories: ["multimedia"],
	example: "/storyfm/index",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["storyfm.cn/"] }],
	name: "首页",
	maintainers: ["sanmmm"],
	handler,
	url: "storyfm.cn/"
};
async function handler() {
	const url = "http://storyfm.cn";
	const $ = load((await got_default(url)).data);
	const cnMonth = [
		"一",
		"二",
		"三",
		"四",
		"五",
		"六",
		"七",
		"八",
		"九",
		"十",
		"十一",
		"十二"
	];
	return {
		title: "故事说FM",
		description: "故事说FM",
		link: url,
		item: $(".isotope > .isotope-item").toArray().map((ele) => {
			const $item = load(ele);
			const img = $item(".isotope-img-container img").attr("src");
			const infoNode = $item(".isotope-index-text").first();
			const title = infoNode.find(".soundbyte-podcast-progression-title");
			const link = infoNode.find("a.soundbyte-podcast-play-progression").attr("href");
			const time = infoNode.find(".fa-clock-o").text();
			const [month, day, year] = infoNode.find(".soundbyte-podcast-date-progression").text().replace(",", "").split(" ").map((value) => {
				if (value.includes("月")) value = cnMonth.findIndex((cnMonthStr) => value.includes(cnMonthStr)) + 1;
				return value;
			});
			const pubDate = (/* @__PURE__ */ new Date(`${year}-${month}-${day} ${time}`)).toUTCString();
			return {
				title,
				description: [`<img src="${img}"/>`, title].join("<br/>"),
				link,
				pubDate
			};
		})
	};
}
//#endregion
export { route };
