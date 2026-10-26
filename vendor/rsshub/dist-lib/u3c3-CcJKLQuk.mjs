import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/u3c3/index.ts
const route = {
	path: ["/search/:keyword/:preview?", "/:type?/:preview?"],
	categories: ["multimedia"],
	example: "/u3c3/search/新片速递",
	parameters: {
		keyword: "Search keyword",
		preview: "Show image preview, off by default, non empty value means on"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	maintainers: ["storytellerF"],
	handler
};
async function handler(ctx) {
	const { type, keyword, preview } = ctx.req.param();
	const rootURL = "https://www.u3c3.com";
	let currentURL;
	let title;
	if (keyword) {
		const { data: home } = await got_default(rootURL);
		const varName = home.match(/search2="\s*\+\s*(\w+)/)?.[1];
		const token = varName ? home.match(new RegExp(String.raw`(?<!/)\bvar\s+${varName}\s*=\s*"([^"]+)"`))?.[1] : void 0;
		currentURL = token ? `${rootURL}/?search2=${token}&search=${encodeURIComponent(keyword)}` : `${rootURL}/?search=${encodeURIComponent(keyword)}`;
		title = `search ${keyword} - u3c3`;
	} else if (type === void 0) {
		currentURL = rootURL;
		title = "home - u3c3";
	} else {
		currentURL = `${rootURL}/?type=${type}&p=1`;
		title = `${type} - u3c3`;
	}
	const $ = load((await got_default(currentURL)).data);
	const list = $("body > div.container > div.table-responsive > table > tbody > tr").toArray().filter((el) => $(el).find("td:nth-of-type(2) > a").attr("href")?.startsWith("/view")).map((el) => {
		const item = $(el);
		const a = item.find("td:nth-of-type(2) > a");
		const guid = rootURL + a.attr("href");
		return {
			title: a.attr("title"),
			guid,
			link: guid,
			pubDate: item.find("td:nth-of-type(5)").text(),
			enclosure_url: item.find("td:nth-of-type(3) > a:nth-of-type(2)").attr("href"),
			enclosure_type: "application/x-bittorrent"
		};
	});
	const items = preview ? await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		item.description = load(response)("div.panel-footer > img:first-child").parent().html();
		return item;
	}))) : list;
	return {
		title,
		description: title,
		link: currentURL,
		item: items
	};
}
//#endregion
export { route };
