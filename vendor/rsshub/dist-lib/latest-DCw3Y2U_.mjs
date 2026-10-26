import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/chinatax/latest.ts
const route = {
	path: "/latest",
	categories: ["government"],
	example: "/gov/chinatax/latest",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.chinatax.gov.cn/*"] }],
	name: "最新文件",
	maintainers: ["nczitzk", "fuzy112"],
	handler,
	url: "www.chinatax.gov.cn/*"
};
async function handler() {
	const link = "http://www.chinatax.gov.cn/chinatax/n810341/n810755/index.html";
	const $ = load((await got_default({
		method: "get",
		url: link
	})).data);
	const list = $("ul.list.whlist li").slice(0, 10).toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), "http://www.chinatax.gov.cn").href
		};
	});
	return {
		title: "国家税务总局 - 最新文件",
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const content = load((await got_default({
					method: "get",
					url: item.link
				})).data);
				item.pubDate = content("meta[name=\"PubDate\"]").attr("content");
				item.description = content("#fontzoom").html();
				return item;
			} catch (error) {
				if (error.name === "HTTPError" || error.name === "FetchError") {
					item.description = error.message;
					return item;
				}
				throw error;
			}
		})))
	};
}
//#endregion
export { route };
