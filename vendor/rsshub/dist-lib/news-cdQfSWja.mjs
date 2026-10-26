import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/alwayscontrol/news.ts
const baseUrl = "https://www.alwayscontrol.com.cn";
const route = {
	path: "/news",
	categories: ["other"],
	example: "/alwayscontrol/news",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新动态",
	maintainers: ["moss-xxh"],
	url: "alwayscontrol.com.cn",
	handler,
	radar: [{
		source: ["www.alwayscontrol.com.cn/zh-CN/news/list"],
		target: "/news"
	}],
	description: "Always Control（旭衡电子）智能能源管理系统解决方案专家的最新动态"
};
async function handler() {
	const listUrl = `${baseUrl}/zh-CN/news/list`;
	const $ = load((await got_default(listUrl)).data);
	const list = $("article").toArray().map((item) => {
		const $item = $(item);
		const title = $item.find("h2").text().trim();
		const date = $item.find("time").text().trim();
		const link = $item.find("a").attr("href");
		const image = $item.find("img").attr("src");
		return {
			title,
			link: link ? `${baseUrl}${link}` : "",
			pubDate: parseDate(date, "YYYY-MM-DD"),
			image: image ? image.startsWith("http") ? image : `${baseUrl}${image}` : ""
		};
	});
	return {
		title: "Always Control - 最新动态",
		link: listUrl,
		description: "Always Control（旭衡电子）- 智能能源管理系统解决方案专家最新动态",
		language: "zh-CN",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			if (!item.link) return item;
			try {
				const $detail = load((await got_default(item.link)).data);
				$detail("article img").each((_, elem) => {
					const $img = $detail(elem);
					const src = $img.attr("src");
					if (src && src.startsWith("/")) $img.attr("src", `${baseUrl}${src}`);
				});
				$detail("article *").each((_, elem) => {
					const $elem = $detail(elem);
					const allowedAttrs = /* @__PURE__ */ new Set([
						"src",
						"href",
						"alt",
						"title"
					]);
					const attrs = Object.keys(elem.attribs || {});
					for (const attr of attrs) if (!allowedAttrs.has(attr)) $elem.removeAttr(attr);
				});
				item.description = $detail("article").html() || "";
				item.author = "旭衡电子(深圳)有限公司";
				item.category = ["公司动态", "最新资讯"];
				return item;
			} catch {
				item.description = item.image ? `<img src="${item.image}">` : "";
				return item;
			}
		}))),
		image: `${baseUrl}/logo.png`
	};
}
//#endregion
export { route };
