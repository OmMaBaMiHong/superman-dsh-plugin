import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cctv/jx.ts
const route = {
	path: "/photo/jx",
	categories: ["traditional-media"],
	example: "/cctv/photo/jx",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["photo.cctv.com/jx", "photo.cctv.com/"] }],
	name: "央视网图片《镜象》",
	maintainers: ["nczitzk"],
	handler,
	url: "photo.cctv.com/jx"
};
async function handler(ctx) {
	const currentUrl = `https://photo.cctv.com/jx/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".textr a").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 10).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	return {
		title: "央视网图片《镜象》",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const date = content("head").html().match(/publishDate ="(.*) ";/)[1];
			item.pubDate = date ? parseDate(date, "YYYYMMDDHHmmss") : null;
			item.description = content(".tujitop").html();
			return item;
		})))
	};
}
//#endregion
export { route };
