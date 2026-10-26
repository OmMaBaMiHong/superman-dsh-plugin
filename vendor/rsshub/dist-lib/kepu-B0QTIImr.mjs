import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hellobtc/kepu.ts
const rootUrl = "https://www.hellobtc.com";
const channelSelector = {
	latest: "div.index_tabs_container.js-tabs-container > div:nth-child(1)",
	bitcoin: "div.index_tabs_container.js-tabs-container > div:nth-child(2)",
	ethereum: "div.index_tabs_container.js-tabs-container > div:nth-child(3)",
	defi: "div.index_tabs_container.js-tabs-container > div:nth-child(4)",
	inter_blockchain: "div.index_tabs_container.js-tabs-container > div:nth-child(5)",
	mining: "div.index_tabs_container.js-tabs-container > div:nth-child(6)",
	safety: "div.index_tabs_container.js-tabs-container > div:nth-child(7)",
	satoshi_nakamoto: "div.index_tabs_container.js-tabs-container > div:nth-child(8)",
	public_blockchain: "div.index_tabs_container.js-tabs-container > div:nth-child(9)"
};
const titleMap = {
	latest: "最新",
	bitcoin: "比特币",
	ethereum: "以太坊",
	defi: "DeFi",
	inter_blockchain: "跨链",
	mining: "挖矿",
	safety: "安全",
	satoshi_nakamoto: "中本聪",
	public_blockchain: "公链"
};
const route = {
	path: "/kepu/:channel?",
	categories: ["new-media"],
	example: "/hellobtc/kepu/latest",
	parameters: { channel: "类型，见下表，默认为最新" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "科普",
	maintainers: ["Fatpandac"],
	handler,
	description: `| latest | bitcoin | ethereum | defi | inter\\_blockchain | mining | safety | satoshi\\_nakomoto | public\\_blockchain |
| ------ | ------- | -------- | ---- | ----------------- | ------ | ------ | ----------------- | ------------------ |
| 最新   | 比特币  | 以太坊   | DeFi | 跨链              | 挖矿   | 安全   | 中本聪            | 公链               |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel") ?? "latest";
	const url = `${rootUrl}/kepu.html`;
	const $ = load((await got_default(url)).data);
	const list = $(channelSelector[channel]).find("div.new_item").toArray().map((item) => ({
		title: $(item).find("a").text(),
		link: $(item).find("a").attr("href")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).data)("#js_content").html().replaceAll(/(<img.*?)data-src(.*?>)/g, "$1src$2");
		return item;
	})));
	return {
		title: `白话区块链 - 科普 ${titleMap[channel]}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
