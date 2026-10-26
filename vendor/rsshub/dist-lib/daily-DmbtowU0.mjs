import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as generateData } from "./utils-sxH0nGKt2.mjs";
//#region lib/routes/zhihu/pin/daily.ts
const route = {
	path: "/pin/daily",
	categories: ["social-media"],
	example: "/zhihu/pin/daily",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["daily.zhihu.com/*"],
		target: "/daily"
	}],
	name: "知乎想法 - 24 小时新闻汇总",
	maintainers: ["xyqfer"],
	handler,
	url: "daily.zhihu.com/*"
};
async function handler() {
	const { data: { data } } = await got_default({
		method: "get",
		url: "https://api.zhihu.com/pins/special/972884951192113152/moments?order_by=newest&reverse_order=0&limit=20"
	});
	return {
		title: "知乎想法-24小时新闻汇总",
		link: "https://www.zhihu.com/pin/special/972884951192113152",
		description: "汇集每天的社会大事、行业资讯，让你用最简单的方式获得想法里的新闻",
		item: generateData(data)
	};
}
//#endregion
export { route };
