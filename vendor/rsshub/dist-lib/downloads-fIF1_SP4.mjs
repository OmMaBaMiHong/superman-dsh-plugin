import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sony/downloads.ts
const host = "https://www.sony.com";
const route = {
	path: "/downloads/:productType/:productId",
	categories: ["program-update"],
	example: "/sony/downloads/product/nw-wm1am2",
	parameters: {
		productType: "product type",
		productId: "product id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["sony.com/electronics/support/:productType/:productId/downloads"] }],
	name: "Software Downloads",
	maintainers: ["EthanWng97"],
	handler,
	description: `::: tip
Open \`https://www.sony.com/electronics/support\` and search for the corresponding product, such as \`Sony A7M4\`, the website corresponding to which is \`https://www.sony.com/electronics/support/e-mount-body-ilce-7-series/ilce-7m4/downloads\`, where \`productType\` is \`e-mount-body-ilce-7-series\` and \`productId\` is \`ilce-7m4\`.
:::`
};
async function handler(ctx) {
	const { productType, productId } = ctx.req.param();
	const url = `${host}/electronics/support/${productType}/${productId}/downloads`;
	const data = (await got_default({
		method: "get",
		url
	})).data;
	const match = load(data)("script:contains(\"window.__PRELOADED_STATE__.downloads\")").text().match(/window\.__PRELOADED_STATE__\.downloads\s*=\s*(\{.*?\});\s*window\.__PRELOADED_STATE__/s);
	let results = {};
	if (match) results = JSON.parse(match[1]).searchResults.results;
	const list = results.map((item) => {
		const data = {
			title: item.title,
			pubDate: item.publicationDate
		};
		const url = item.url;
		if (url.startsWith("http")) data.url = url;
		else if (url.startsWith("//")) data.url = "https:" + url;
		else data.url = host + url;
		return data;
	});
	return {
		title: `Sony - ${productId.toUpperCase()}`,
		link: url,
		description: `Sony - ${productId.toUpperCase()}`,
		item: list.map((item) => ({
			title: item.title,
			guid: item.title + " - " + item.url,
			link: item.url,
			pubDate: item.pubDate
		}))
	};
}
//#endregion
export { route };
