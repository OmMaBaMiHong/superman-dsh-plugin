import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nasa/apod-ncku.ts
const route = {
	path: "/apod-ncku",
	categories: ["picture"],
	example: "/nasa/apod-ncku",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["apod.nasa.govundefined"] }],
	name: "Cheng Kung University Mirror",
	maintainers: ["nczitzk", "williamgateszhao"],
	handler,
	url: "apod.nasa.govundefined"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/archivepix.html";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const list = $("body > b > a").slice(0, limit).toArray().map((el) => ({
		title: $(el).text(),
		link: `http://sprite.phys.ncku.edu.tw/astrolab/mirrors/apod/${$(el).attr("href")}`
	}));
	return {
		title: "NASA 每日一天文圖 (成大物理分站) ",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const description = `<img src="${content("img").attr("src")}"> <br> ${content("body > center").eq(1).html()} <br> ${content("body > p").eq(0).html()}`;
			const pubDate = parseDate(item.link.slice(-11, -5), "YYMMDD");
			return {
				title: item.title,
				description,
				pubDate,
				link: item.link
			};
		})))
	};
}
//#endregion
export { route };
