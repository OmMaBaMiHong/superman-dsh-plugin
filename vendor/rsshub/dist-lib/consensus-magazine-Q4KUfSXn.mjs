import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as parseItem } from "./utils-C2nR_u6B.mjs";
import { load } from "cheerio";
//#region lib/routes/coindesk/consensus-magazine.ts
const rootUrl = "https://www.coindesk.com";
const route = {
	path: "/consensus-magazine",
	categories: ["new-media"],
	example: "/coindesk/consensus-magazine",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["coindesk.com/"] }],
	name: "新闻周刊",
	maintainers: ["jameshih"],
	handler,
	url: "coindesk.com/"
};
async function handler() {
	const channel = "consensus-magazine";
	const $ = load(await rofetch(`${rootUrl}/${channel}`));
	const list = $("div h2").toArray().map((item) => {
		const $item = $(item);
		return {
			title: $item.text(),
			link: rootUrl + $item.parent().attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => parseItem(item))));
	return {
		title: "CoinDesk Consensus Magazine",
		link: `${rootUrl}/${channel}`,
		item: items
	};
}
//#endregion
export { route };
