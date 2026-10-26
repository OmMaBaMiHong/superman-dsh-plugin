import { t as got_default } from "./got-Dnzt41dd.mjs";
import { JSDOM } from "jsdom";
//#region lib/routes/hotukdeals/hottest.ts
const route = {
	path: "/hottest",
	categories: ["shopping"],
	example: "/hotukdeals/hottest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.hotukdeals.com/"] }],
	name: "hottest",
	maintainers: ["DIYgod"],
	handler,
	url: "www.hotukdeals.com/"
};
async function handler() {
	return {
		title: "hotukdeals hottest",
		link: "https://www.hotukdeals.com/",
		item: new JSDOM((await got_default.get("https://www.hotukdeals.com/", { headers: { Referer: "https://www.hotukdeals.com/" } })).data, { runScripts: "dangerously" }).window.__INITIAL_STATE__.widgets.hottestWidget.threads.map((item) => ({
			title: item.title,
			description: `<img src="https://images.hotukdeals.com/${item.mainImage.path}/${item.mainImage.name}/re/768x768/qt/60/${item.mainImage.name}.jpg"><br>${item.temperature}° ${item.title}<br>${item.displayPrice}`,
			link: item.url
		}))
	};
}
//#endregion
export { route };
