import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as utils_default } from "./utils-Cx1v_Np5.mjs";
//#region lib/routes/leiphone/newsflash.ts
const route = {
	path: "/newsflash",
	categories: ["new-media"],
	example: "/leiphone/newsflash",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["leiphone.com/"] }],
	name: "业界资讯",
	maintainers: [],
	handler,
	url: "leiphone.com/"
};
async function handler() {
	const url = "https://www.leiphone.com/site/YejieKuaixun";
	const list = (((await got_default.get(url)).data || {}).article || []).map((item) => item.url);
	return {
		title: "雷峰网 业界资讯",
		description: "雷峰网 - 读懂智能&未来",
		link: url,
		item: await utils_default.ProcessFeed(list, cache_default)
	};
}
//#endregion
export { route };
