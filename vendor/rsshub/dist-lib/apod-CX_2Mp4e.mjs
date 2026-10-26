import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nasa/apod.ts
const route = {
	path: "/apod",
	categories: ["picture"],
	view: 2,
	example: "/nasa/apod",
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
	name: "Astronomy Picture of the Day",
	maintainers: ["nczitzk", "williamgateszhao"],
	handler,
	url: "apod.nasa.govundefined"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const rootUrl = "https://apod.nasa.gov/apod/archivepix.html";
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	const list = $("body > b > a").slice(0, limit).toArray().map((el) => ({
		title: $(el).text(),
		link: `https://apod.nasa.gov/apod/${$(el).attr("href")}`
	}));
	return {
		title: "NASA Astronomy Picture of the Day",
		link: rootUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default({
				method: "get",
				url: item.link
			})).data);
			const description = `<img src="${content("img").attr("src")}"> <br> ${content("body > center").eq(1).html()} <br> ${content("body > p").eq(0).html()}`;
			const pubDate = timezone(parseDate(item.link.slice(-11, -5), "YYMMDD"), -5);
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
