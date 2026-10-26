import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { load } from "cheerio";
//#region lib/routes/tophub/index.ts
const route = {
	path: "/:id",
	categories: ["new-media"],
	example: "/tophub/Om4ejxvxEN",
	parameters: { id: "榜单id，可在 URL 中找到" },
	features: {
		requireConfig: [{
			name: "TOPHUB_COOKIE",
			optional: true,
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tophub.today/n/:id"] }],
	name: "榜单",
	maintainers: ["LogicJake"],
	handler
};
async function handler(ctx) {
	const link = `https://tophub.today/n/${ctx.req.param("id")}`;
	const $ = load(await rofetch(link, { headers: {
		Referer: "https://tophub.today",
		Cookie: config.tophub?.cookie ?? ""
	} }));
	const title = $(".tt h3").text().trim();
	const out = $(".rank-all-item:not(.history-content) .jc-c tr").toArray().map((e) => {
		return {
			title: $(e).find("td a").first().text(),
			link: $(e).find("td a").first().attr("href"),
			description: $(e).find(".ws").text().trim()
		};
	});
	return {
		title,
		description: $(".tt p").text().trim(),
		image: $(".ii img").attr("src"),
		link,
		item: out
	};
}
//#endregion
export { route };
