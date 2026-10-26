import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as utils_default } from "./utils-BrS5E3W7.mjs";
//#region lib/routes/nintendo/eshop-cn.ts
const software_url = "https://www.nintendoswitch.com.cn/software/";
const route = {
	path: "/eshop/cn",
	radar: [{ source: ["nintendoswitch.com.cn/software", "nintendoswitch.com.cn/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "nintendoswitch.com.cn/software"
};
async function handler() {
	const response = await got_default(software_url);
	const result = await utils_default.nuxtReader(response.data);
	if (!result.recentSoftwareList) throw new InvalidParameterError("软件信息不存在，请报告这个问题");
	let data = result.recentSoftwareList.map((item) => ({
		title: item.title,
		description: utils_default.generateImageLink(item.imgUrl),
		link: item.jumpUrl.startsWith("http") ? item.jumpUrl : `${software_url}${item.jumpUrl}`,
		pubDate: parseDate(item.publishTime, "YYYY.MM.DD")
	}));
	data = await utils_default.ProcessItemChina(data, cache_default);
	return {
		title: "Nintendo eShop（国服）新游戏",
		link: "https://www.nintendoswitch.com.cn/software",
		description: "Nintendo（国服）新上架的游戏",
		item: data
	};
}
//#endregion
export { route };
