import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/cnu/physics.ts
const route = {
	path: "/physics",
	categories: ["university"],
	example: "/cnu/physics",
	parameters: {},
	radar: [{
		source: ["physics.cnu.edu.cn/news/index.htm"],
		target: "/cnu/physics"
	}],
	name: "物理系院系新闻",
	maintainers: ["liueic"],
	handler,
	url: "physics.cnu.edu.cn/news/index.htm",
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
	const baseUrl = "https://physics.cnu.edu.cn";
	const link = `${baseUrl}/news/index.htm`;
	const $ = load((await got_default(link)).data);
	return {
		title: "首都师范大学物理系 - 院系新闻",
		link,
		description: "首都师范大学物理系院系新闻",
		item: $(".list ul > li").has("span").toArray().map((e) => {
			const item = $(e);
			const span = item.find("span");
			const a = item.find("a");
			const dateMatch = span.text().trim().match(/\[(\d{4}-\d{2}-\d{2})\]/);
			const pubDate = dateMatch ? parseDate(dateMatch[1], "YYYY-MM-DD") : void 0;
			const title = a.text().trim() || a.attr("title") || "";
			const hrefMatch = (a.attr("onclick") || "").match(/checkXnwk\(['"]([^'"]+)['"]/);
			const href = hrefMatch ? hrefMatch[1] : "";
			let linkUrl = "";
			if (href) if (href.startsWith("http")) linkUrl = href;
			else try {
				linkUrl = new URL(href, `${baseUrl}/news/`).href;
			} catch {
				linkUrl = href.startsWith("../") ? `${baseUrl}/${href.replaceAll("../", "")}` : `${baseUrl}/news/${href}`;
			}
			return {
				title,
				link: linkUrl,
				pubDate,
				description: ""
			};
		}).filter((item) => item.title && item.link)
	};
}
//#endregion
export { route };
