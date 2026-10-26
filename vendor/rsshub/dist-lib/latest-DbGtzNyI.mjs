import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/caixinglobal/latest.ts
const route = {
	path: "/latest",
	categories: ["traditional-media"],
	example: "/caixinglobal/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["caixinglobal.com/news", "caixinglobal.com/"] }],
	name: "Latest News",
	maintainers: ["TonyRL"],
	handler,
	url: "caixinglobal.com/news"
};
async function handler(ctx) {
	const { data } = await got_default("https://gateway.caixin.com/api/extapi/homeInterface.jsp", { searchParams: {
		subject: "100990318;100990314;100990311",
		start: 0,
		count: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20,
		type: "2",
		_: Date.now()
	} });
	const list = data.datas.map((e) => ({
		title: e.desc,
		description: e.summ,
		link: e.link,
		pubDate: parseDate(e.time),
		category: e.tags.map((t) => t.name),
		nid: e.nid,
		attr: e.attr,
		enclosure_url: e.audioUrl,
		enclosure_type: e.audioUrl ? "audio/mpeg" : void 0,
		itunes_item_image: e.audioUrl ? e.pict.imgs[0].url : void 0
	}));
	return {
		title: "The Latest Top Headlines on China - Caixin Global",
		description: "The latest headlines on China finance, companies, politics, international affairs and other China-related issues from around the world. Caixin Global",
		language: "en",
		link: "https://www.caixinglobal.com/news/",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const { data } = await got_default(item.link);
			const $ = load(data);
			$(".loadingBox, .cons-pay-tip").remove();
			let content = $("#appContent").prop("outerHTML");
			if (item.attr === 0) {
				const { data } = await got_default("https://u.caixinglobal.com/get/reading.do", { searchParams: {
					id: item.nid,
					source: "",
					url: item.link,
					_: Date.now()
				} });
				content = data.data.content;
			}
			item.description = $(".cons-photo").prop("outerHTML") + content;
			return item;
		})))
	};
}
//#endregion
export { route };
