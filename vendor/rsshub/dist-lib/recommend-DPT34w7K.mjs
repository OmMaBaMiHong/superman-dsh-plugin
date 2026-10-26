import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as rootUrl, t as getCookie } from "./utils-DwPSu1in.mjs";
import { load } from "cheerio";
//#region lib/routes/yxdown/recommend.ts
const route = {
	path: "/recommend",
	categories: ["game"],
	example: "/yxdown/recommend",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["yxdown.com/"] }],
	name: "精彩推荐",
	maintainers: ["nczitzk"],
	handler,
	url: "yxdown.com/"
};
async function handler() {
	const currentUrl = `${rootUrl}/news/`;
	const cookie = await getCookie();
	const $ = load((await got_default(currentUrl, { headers: { cookie } })).data);
	const list = $("ul li a b").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.parent().attr("href")
		};
	});
	return {
		title: "精彩推荐 - 游讯网",
		link: currentUrl,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const content = load((await got_default(item.link, { headers: { cookie } })).data);
			content("h1, .intro").remove();
			item.description = content(".news").html();
			item.pubDate = timezone(parseDate(content("meta[property=\"og:release_date\"]").attr("content")), 8);
			return item;
		})))
	};
}
//#endregion
export { route };
