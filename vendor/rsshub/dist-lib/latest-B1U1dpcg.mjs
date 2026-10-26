import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderGoods } from "./goods-CRIKOqjy.mjs";
//#region lib/routes/xiaomiyoupin/utils.ts
const parseModule = (floors, module_key) => floors.find((floor) => floor.module_key === module_key);
const parseFloorItem = (floor) => floor.data.items.map((item) => {
	const i = item.item;
	return {
		title: i.name,
		link: i.jump_url,
		guid: `xiaomiyoupin:${i.gid}`,
		description: renderGoods(i),
		pubDate: (i.start || i.start_time) * 1e3
	};
});
//#endregion
//#region lib/routes/xiaomiyoupin/latest.ts
const route = {
	path: "/latest",
	categories: ["shopping"],
	example: "/xiaomiyoupin/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaomiyoupin.com/"] }],
	name: "小米有品每日上新",
	maintainers: [
		"xyqfer",
		"DIYgod",
		"bigfei"
	],
	handler,
	url: "xiaomiyoupin.com/"
};
async function handler() {
	return {
		title: "小米有品每日上新",
		link: "https://m.xiaomiyoupin.com/w/newproduct?pageid=1605",
		description: "小米有品每日上新",
		item: parseFloorItem(parseModule((await got_default("https://m.xiaomiyoupin.com/homepage/main/v1005")).data.data.homepage.floors, "product_hot"))
	};
}
//#endregion
export { route };
