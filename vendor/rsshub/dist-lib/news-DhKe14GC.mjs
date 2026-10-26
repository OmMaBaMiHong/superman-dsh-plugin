import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/chaincatcher/news.ts
const rootUrl = "https://www.chaincatcher.com";
const route = {
	path: "/news",
	categories: ["new-media"],
	example: "/chaincatcher/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["chaincatcher.com/news", "chaincatcher.com/"] }],
	name: "快讯",
	maintainers: ["TonyRL"],
	handler,
	url: "chaincatcher.com/news"
};
async function handler() {
	const { data } = await got_default.post(`${rootUrl}/index/content/lists`, { form: {
		page: 1,
		categoryid: 3
	} });
	const $ = load(data.data, null, false);
	$(".share").remove();
	const items = $(".block").toArray().map((item) => {
		item = $(item);
		item.find(".tips").remove();
		return {
			title: `${!!item.find(".act-title").text() ? "[重] " : ""}${item.find(".title").text()}`,
			description: item.find(".summary").text(),
			link: `${rootUrl}${item.find("a").first().attr("href")}`,
			pubDate: timezone(parseDate(item.find(".time").text(), "YYYY-MM-DD HH:mm:ss"), 8)
		};
	});
	return {
		title: "最新资讯-ChainCatcher",
		description: "链捕手ChainCatcher为区块链技术爱好者与项目决策者提供NFT、Web3社交、DID、Layer2等专业的资讯与研究内容，Chain Catcher输出对Scroll、Sui、Aptos、ENS等项目的思考，拓宽读者对区块链与数字经济认知的边界。",
		image: `${rootUrl}/logo.png`,
		link: `${rootUrl}/news`,
		item: items
	};
}
//#endregion
export { route };
