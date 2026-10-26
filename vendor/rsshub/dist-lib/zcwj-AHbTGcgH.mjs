import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/miit/zcwj.ts
const route = {
	path: "/zcwj",
	categories: ["government"],
	example: "/gov/miit/zcwj",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "政策文件",
	maintainers: ["Yoge-Code"],
	handler
};
async function handler() {
	const base_url = "http://www.miit.gov.cn/n1146295/n1652858/";
	const list = load((await got_default.get(base_url)).data)(".clist_con li").toArray();
	const ProcessFeed = (data) => {
		return load(data)("p").text();
	};
	return {
		title: "中国工业化和信息部",
		link: "http://www.miit.gov.cn",
		description: "政策文件",
		item: await Promise.all(list.map(async (item) => {
			const $a = load(item)("a");
			let link = $a.attr("href");
			if (link.startsWith("..")) link = base_url + link;
			const cacheIn = await cache_default.get(link);
			if (cacheIn) return JSON.parse(cacheIn);
			const response = await got_default({
				method: "get",
				url: link
			});
			const single = {
				title: $a.text(),
				description: ProcessFeed(response.data),
				link
			};
			cache_default.set(link, JSON.stringify(single));
			return single;
		}))
	};
}
//#endregion
export { route };
