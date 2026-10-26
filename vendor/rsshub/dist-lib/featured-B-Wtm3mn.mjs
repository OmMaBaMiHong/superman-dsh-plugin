import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as utils_default } from "./utils-Bcc1WW3J.mjs";
import { load } from "cheerio";
//#region lib/routes/thepaper/featured.ts
const route = {
	path: "/featured",
	categories: ["new-media"],
	example: "/thepaper/featured",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["thepaper.cn/"] }],
	name: "首页头条",
	maintainers: [
		"HenryQW",
		"nczitzk",
		"bigfei"
	],
	handler,
	url: "thepaper.cn/"
};
async function handler(ctx) {
	const response = await rofetch("https://m.thepaper.cn", { headers: { Cookie: "blackAndWhiteMode=0; redTops=0;" } });
	const nextData = load(response)("#__NEXT_DATA__").text();
	const data = JSON.parse(nextData);
	const list = [...data.props.pageProps.data.list, ...data.props.pageProps.topData.recommendImg];
	return {
		title: "澎湃新闻 - 首页头条",
		link: "https://m.thepaper.cn",
		item: await Promise.all(list.map((item) => utils_default.ProcessItem(item, ctx))),
		itunes_author: "澎湃新闻",
		image: utils_default.ExtractLogo(response)
	};
}
//#endregion
export { route };
