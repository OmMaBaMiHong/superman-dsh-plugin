import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/okx/index.ts
const route = {
	path: "/:section?",
	categories: ["finance"],
	example: "/okx/new-listings",
	parameters: { section: {
		description: "公告版块",
		default: "latest-announcements",
		options: [
			{
				value: "latest-announcements",
				label: "最新公告"
			},
			{
				value: "new-listings",
				label: "新币种上线"
			},
			{
				value: "delistings",
				label: "币对下线"
			},
			{
				value: "trading-updates",
				label: "交易规则更新"
			},
			{
				value: "deposit-withdrawal-suspension-resumption",
				label: "充提暂停/恢复公告"
			},
			{
				value: "p2p-trading",
				label: "C2C 公告"
			},
			{
				value: "web3",
				label: "Web3"
			},
			{
				value: "earn",
				label: "赚币"
			},
			{
				value: "jumpstart",
				label: "Jumpstart"
			},
			{
				value: "api",
				label: "API公告"
			},
			{
				value: "okb-buy-back-burn",
				label: "OKB销毁"
			},
			{
				value: "others",
				label: "其他"
			}
		]
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["www.okx.com/zh-hans/help/section/:section"],
		target: "/:section"
	}],
	name: "公告",
	maintainers: ["lxl66566"],
	handler
};
async function handler(ctx) {
	const baseUrl = "https://www.okx.com";
	let { section = "latest-announcements" } = ctx.req.param();
	section = section.replace(/^announcements-/, "");
	const $ = load(await rofetch(`${baseUrl}/zh-hans/help/section/announcements-${section}`));
	const ssrData = JSON.parse($("script[data-id=\"__app_data_for_ssr__\"]").text());
	const itemsTemp = ssrData?.appContext?.initialProps?.sectionData?.articleList?.items?.map((item) => ({
		title: item.title,
		link: `${baseUrl}/zh-hans/help/${item.slug}`,
		pubDate: new Date(item.publishTime)
	})) || [];
	const items = await Promise.all(itemsTemp.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data)("div[class^=\"index_richTextContent\"]").html();
		return {
			...item,
			description: content || "内容获取失败"
		};
	})));
	return {
		title: ssrData?.appContext?.serverSideProps?.sectionOutline?.title || "Unknown",
		link: `${baseUrl}/zh-hans/help/section/announcements-${section}`,
		item: items,
		allowEmpty: true
	};
}
//#endregion
export { route };
