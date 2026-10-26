import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/wufazhuce/one.ts
const apiUrl = "https://wufazhuce.com/";
const NAME = "「ONE · 一个」";
const route = {
	path: "/one",
	categories: ["new-media"],
	example: "/wufazhuce/one",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["wufazhuce.com"],
		target: "/one"
	}],
	name: NAME,
	maintainers: ["sicheng1806"],
	handler
};
async function handler() {
	const $ = load((await got_default(apiUrl)).body);
	let items = [
		...$("#carousel-one div.item").toArray().map((item) => {
			const a = $(item).find(".fp-one-cita a").first();
			return {
				title: a.text(),
				link: a.attr("href"),
				description: "",
				category: "摄影"
			};
		}),
		...$(".fp-one-articulo a").toArray().map((item) => {
			const a = $(item);
			return {
				title: a.text(),
				link: a.attr("href"),
				description: "",
				category: "文章"
			};
		}),
		...$(".fp-one-cuestion a").toArray().map((item) => {
			const a = $(item);
			return {
				title: a.text(),
				link: a.attr("href"),
				description: "",
				category: "问题"
			};
		})
	];
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load((await got_default(item.link)).body)(".tab-content").html() || "";
		return item;
	})));
	return {
		title: NAME,
		link: apiUrl,
		item: items,
		description: "复杂世界里, 一个就够了. One is all."
	};
}
//#endregion
export { route };
