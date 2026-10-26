import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cnu/jdxw.ts
const route = {
	path: "/jdxw",
	categories: ["university"],
	example: "/cnu/jdxw",
	parameters: {},
	radar: [{
		source: ["news.cnu.edu.cn/xysx/jdxw/index.htm"],
		target: "/cnu/jdxw"
	}],
	name: "焦点关注",
	maintainers: ["liueic"],
	handler,
	url: "news.cnu.edu.cn/xysx/jdxw/index.htm",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	}
};
async function handler() {
	const baseUrl = "https://news.cnu.edu.cn";
	const link = `${baseUrl}/xysx/jdxw/index.htm`;
	const $ = load((await got_default(link)).data);
	return {
		title: "首都师范大学新闻网 - 焦点关注",
		link,
		description: "首都师范大学新闻网焦点关注栏目最新新闻",
		item: $("ul.list3 > li").toArray().map((e) => {
			const item = $(e);
			const href = item.find("a").attr("href");
			const linkUrl = href?.startsWith("http") ? href : `${baseUrl}/xysx/jdxw/${href}`;
			return {
				title: item.find("span.listTitle").text().trim(),
				link: linkUrl,
				pubDate: parseDate(item.find("span.listDate").text().trim(), "YYYY-MM-DD"),
				description: ""
			};
		})
	};
}
//#endregion
export { route };
