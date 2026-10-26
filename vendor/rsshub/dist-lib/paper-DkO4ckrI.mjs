import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as utils_default } from "./utils-CXYEvGNS.mjs";
import { load } from "cheerio";
import pMap from "p-map";
//#region lib/routes/x-mol/paper.ts
const route = {
	path: "/paper/:type/:magazine",
	categories: ["journal"],
	example: "/x-mol/paper/0/9",
	parameters: {
		type: "type",
		magazine: "magazine"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Journal",
	maintainers: ["cssxsh"],
	handler
};
async function handler(ctx) {
	const { type, magazine } = ctx.req.param();
	const path = `paper/${type}/${magazine}`;
	const link = new URL(path, utils_default.host).href;
	const response = await got_default(link, { headers: { Cookie: "journalIndexViewType=grid" } });
	const data = response.data;
	const $ = load(data);
	const item = await pMap($(".magazine-model-content-new li").toArray().slice(0, ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20).map((item) => {
		item = $(item);
		return {
			title: item.find(".magazine-text-title a").text().trim(),
			link: new URL(item.find(".magazine-model-btn a").first().attr("href"), utils_default.host).href,
			pubDate: timezone(parseDate(item.find(".magazine-text-atten").text().match(/\d{4}-\d{2}-\d{2}/)[0], 8))
		};
	}), (element) => cache_default.tryGet(element.link, async () => {
		const description = load((await got_default(element.link)).data)(".maga-content");
		element.doi = description.find(".itsmblue").eq(1).text().trim();
		description.find(".itgaryfirst").remove();
		description.find("span").eq(0).remove();
		element.author = description.find("span").eq(0).text().trim();
		description.find("span").eq(0).remove();
		element.description = description.html();
		return element;
	}), { concurrency: 2 });
	return {
		title: $("title").text(),
		link: response.url,
		description: $("meta[name=\"description\"]").attr("content"),
		item
	};
}
//#endregion
export { route };
