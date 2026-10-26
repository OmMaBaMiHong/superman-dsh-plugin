import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/sspai/series.ts
const route = {
	path: "/series",
	categories: ["new-media"],
	example: "/sspai/series",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sspai.com/series"] }],
	name: "最新上架付费专栏",
	maintainers: ["HenryQW"],
	handler,
	url: "sspai.com/series",
	description: "> 少数派专栏需要付费订阅，RSS 仅做更新提醒，不含付费内容."
};
async function handler() {
	const products = (await rofetch("https://sspai.com/api/v1/series/tag/all/get", { parseResponse: JSON.parse })).data.flatMap((category) => category.children.filter((item) => item.sell_status).map((item) => {
		const price = item.price / 100;
		return {
			id: item.id,
			title: `￥${price} - ${item.title}`,
			link: `https://sspai.com/series/${item.id}`,
			author: item.author.nickname
		};
	}));
	return {
		title: "少数派 -- 最新上架付费专栏",
		link: "https://sspai.com/series",
		description: "少数派 -- 最新上架付费专栏",
		item: await Promise.all(products.map((item) => cache_default.tryGet(item.link, async () => {
			const data = (await rofetch(`https://sspai.com/api/v1/series/info/get?id=${item.id}&view=second`)).data;
			const $ = load(`<img src="https://cdn.sspai.com/${data.banner_web}" />` + data.intro);
			$("img").css("max-width", "100%");
			item.description = $.html();
			return item;
		})))
	};
}
//#endregion
export { route };
