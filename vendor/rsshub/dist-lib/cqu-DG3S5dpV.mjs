import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/cqu/index.ts
const route = {
	path: "/jwc/:path{.+}?",
	categories: ["university"],
	example: "/cqu/jwc/index/tzgg",
	parameters: { path: {
		description: "路径参数，默认为 `index/tzgg`",
		default: "index/tzgg"
	} },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.cqu.edu.cn/:path"],
		target: "/jwc/:path"
	}],
	name: "本科教学信息网通知",
	maintainers: ["AhsokaTano26"],
	handler
};
async function handler(ctx) {
	const { path = "index/tzgg" } = ctx.req.param();
	const url = new URL(`${path}.htm`, "http://jwc.cqu.edu.cn").href;
	const $ = load(await rofetch(url));
	const list = $("div.page-contner.fl li.pot-r").toArray().map((item) => {
		item = $(item);
		const a = item.find("a.no-wrap");
		const link = new URL(a.attr("href"), url).href;
		return {
			title: a.attr("title"),
			link,
			pubDate: parseDate(item.find("span.fr").text())
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		item.description = load(await rofetch(item.link))("form[name=\"_newscontent_fromname\"] div#vsb_content").find("div.v_news_content").html();
		return item;
	})));
	return {
		title: $("title").text().replace(/--/, " - "),
		link: url,
		item: items
	};
}
//#endregion
export { route };
