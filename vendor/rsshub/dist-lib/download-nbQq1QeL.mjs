import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/ifi-audio/download.ts
const route = {
	path: "/download/:val/:id",
	categories: ["program-update"],
	example: "/ifi-audio/download/1503007035/44472",
	parameters: {
		val: "product val",
		id: "product id"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Download Hub",
	maintainers: ["EthanWng97"],
	handler,
	description: `::: warning

1. Open <https://ifi-audio.com/download-hub> and the Network panel
2. Select the device and the corresponding serial number in the website and click Search
3. Find the last request named \`https://ifi-audio.com/wp-admin/admin-ajax.php\` in the Network panel, find out the val and id in the Payload panel, and fill in the url

:::`
};
async function handler(ctx) {
	const { val, id } = ctx.req.param();
	const markup = (await got_default({
		method: "post",
		url: "https://ifi-audio.com/wp-admin/admin-ajax.php",
		headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
		body: "action=ifi-ff-get-firmware&val=" + val + "&id=" + id
	})).data.data.markup;
	const $ = load(markup);
	return {
		title: "iFi audio Download Hub",
		link: "https://ifi-audio.com/download-hub/",
		description: "iFi audio Download Hub",
		item: [{
			title: $("li[data-category=firmware]:first h4").text(),
			description: markup,
			link: $("li[data-category=firmware]:first a").attr("href")
		}]
	};
}
//#endregion
export { route };
