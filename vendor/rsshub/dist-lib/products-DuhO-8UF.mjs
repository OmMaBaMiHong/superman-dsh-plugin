import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/resonac/products.ts
const baseUrl = "https://www.resonac.com";
const host = "https://www.resonac.com/products?intcid=glnavi_products";
const route = {
	path: "/products",
	categories: ["other"],
	example: "/resonac/products",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Products",
	maintainers: ["valuex"],
	handler,
	description: ""
};
async function handler() {
	const pageHtml = (await got_default(host)).data;
	const $ = load(pageHtml);
	const groupLists = $("div.m-panel-card-link ul li").toArray().map((el) => ({
		groupName: $("a", el).text().trim(),
		groupURL: baseUrl + $("a", el).attr("href")
	}));
	const fullList = (await Promise.all(groupLists.map((productGroup) => cache_default.tryGet(productGroup.groupURL, async () => {
		const strUrl = productGroup.groupURL;
		const $ = load((await got_default(strUrl)).data);
		return $("dt.m-toggle__title div span a").toArray().map((el) => ({
			title: $("b", el).text().trim(),
			link: baseUrl + $(el).attr("href"),
			group: productGroup.groupName
		}));
	})))).flat();
	const items = await Promise.all(fullList.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const $ = load((await got_default(item.link)).data);
			item.title = item.title + " | " + item.group;
			item.description = $("main div.str-section").html();
			return item;
		} catch (error) {
			return error.message;
		}
	})));
	return {
		title: "Resonac_Products",
		link: baseUrl,
		description: "Resonac_Products",
		item: items
	};
}
//#endregion
export { route };
