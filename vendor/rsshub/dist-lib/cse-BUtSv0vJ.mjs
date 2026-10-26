import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sysu/cse.ts
const route = {
	path: "/cse",
	categories: ["university"],
	example: "/sysu/cse",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["cse.sysu.edu.cn/"] }],
	name: "数据科学与计算机学院动态",
	maintainers: [],
	handler,
	url: "cse.sysu.edu.cn/"
};
async function handler() {
	const $ = load((await got_default({
		method: "get",
		url: "http://cse.sysu.edu.cn/",
		headers: { Referer: "http://cse.sysu.edu.cn/" }
	})).data);
	const block_index = [
		{
			index: 1,
			description_header: "学院新闻"
		},
		{
			index: 2,
			description_header: "学院通知"
		},
		{
			index: 3,
			description_header: "人才招聘"
		},
		{
			index: 4,
			description_header: "学术活动"
		},
		{
			index: 5,
			description_header: "学工通知"
		},
		{
			index: 6,
			description_header: "学生活动"
		},
		{
			index: 7,
			description_header: "教务通知"
		},
		{
			index: 8,
			description_header: "科研通知"
		},
		{
			index: 9,
			description_header: "人事通知"
		},
		{
			index: 10,
			description_header: "党群工作"
		},
		{
			index: 11,
			description_header: "校友工作"
		},
		{
			index: 12,
			description_header: "社会工作"
		}
	];
	function getDetail(item, description_header) {
		return {
			title: description_header + ": " + item.attribs.title,
			description: description_header + ": " + item.attribs.title,
			link: item.attribs.href,
			category: description_header
		};
	}
	const item_data = [];
	for (const element of block_index) {
		const block_news = $("#block-views-homepage-block-" + element.index + "> div > div.view-content > div > ul > li > a");
		for (const block_new of block_news) item_data.push(getDetail(block_new, element.description_header));
	}
	function compareLink(a, b) {
		let a_str = a.link;
		a_str = a_str.slice(-4, a_str.length - 4 + 4);
		const a_int = Number.parseInt(a_str);
		let b_str = b.link;
		b_str = b_str.slice(-4, b_str.length - 4 + 4);
		return Number.parseInt(b_str) - a_int;
	}
	item_data.sort(compareLink);
	return {
		title: "中山大学 - 数据科学与计算机学院",
		link: "http://cse.sysu.edu.cn",
		description: "中山大学 - 数据科学与计算机学院",
		language: "zh-cn",
		item: item_data
	};
}
//#endregion
export { route };
