import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/btbtla/detail.ts
const route = {
	path: "/detail/:name",
	categories: ["multimedia"],
	example: "/btbtla/detail/雍正王朝",
	parameters: { name: "电影 | 电视剧名称" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	name: "BTBTLA | 指定剧名",
	maintainers: ["Hermes1030"],
	handler
};
async function handler(ctx) {
	const idUrl = await getId(ctx.req.param("name"));
	if (!idUrl) return null;
	const detailLink = "https://www.btbtla.com" + idUrl;
	const $ = load(await rofetch(detailLink));
	const itemElements = $("div[name=download-list] .module-downlist.selected .module-row-one.active .module-row-info").toArray();
	const items = await Promise.all(itemElements.map(async (element) => {
		const $row = $(element);
		const title = $row.find(".module-row-title h4").text().trim();
		const link = $row.find(".module-row-text").attr("href");
		return {
			title,
			link,
			enclosure_url: await cache_default.tryGet(`btbtla:magnet:${link}`, async () => {
				if (link) return await getMagnet("https://www.btbtla.com" + link);
				return "";
			}),
			enclosure_type: "application/x-bittorrent"
		};
	}));
	const moduleTitle = "BTBTLA | " + $(".page-title").text();
	return {
		title: moduleTitle,
		link: detailLink,
		description: moduleTitle,
		item: items
	};
}
async function getId(name) {
	return load(await rofetch("https://www.btbtla.com/search/" + name))(`.module-items .module-item-titlebox a[title="${name}"]`).attr("href");
}
async function getMagnet(link) {
	if (!link) return null;
	return load(await rofetch(link))(".btn-important").attr("href");
}
//#endregion
export { route };
