import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as utils_default } from "./utils-BrS5E3W7.mjs";
//#region lib/routes/nintendo/news-china.ts
const news_url = "https://www.nintendoswitch.com.cn";
const route = {
	path: "/news/china",
	categories: ["game"],
	example: "/nintendo/news/china",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["nintendoswitch.com.cn/"] }],
	name: "首页资讯（中国）",
	maintainers: ["NeverBehave"],
	handler,
	url: "nintendoswitch.com.cn/"
};
async function handler() {
	const response = await got_default(news_url);
	const result = await utils_default.nuxtReader(response.data);
	if (!result.newsList) throw new InvalidParameterError("新闻信息不存在，请报告这个问题");
	let data = result.newsList.map((item) => ({
		title: item.title,
		description: utils_default.generateImageLink(item.imgUrl),
		link: `${news_url}/topics/${item.jumpUrl}`
	}));
	data = await utils_default.ProcessNewsChina(data, cache_default);
	return {
		title: "Nintendo（中国大陆）主页资讯",
		link: "https://www.nintendoswitch.com.cn",
		description: "Nintendo 中国大陆官网刊登的资讯",
		item: data
	};
}
//#endregion
export { route };
