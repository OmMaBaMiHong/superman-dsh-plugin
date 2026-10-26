import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/cc-notice.ts
const route = {
	path: "/cc/:type?",
	categories: ["university"],
	example: "/nankai/cc/13291",
	parameters: { type: "栏目编号（若为空则默认为\"最新动态\"）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["cc.nankai.edu.cn", "cc.nankai.edu.cn/:type/list.htm"],
		target: "/cc/:type?"
	}],
	name: "计算机学院",
	maintainers: ["vicguo0724"],
	description: `| 最新动态 | 学院公告 | 学生工作通知 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 境外交流 |
| -------- | -------- | ------------ | -------- | ---------- | -------- | ---------- | ---------- | -------- |
| 13291    | 13292    | 13293        | 13294    | 13295      | 13296    | 13297      | 13298      | 13299    |`,
	url: "cc.nankai.edu.cn",
	handler: async (ctx) => {
		const { type = "13291" } = ctx.req.param();
		const baseUrl = "https://cc.nankai.edu.cn";
		const { data: response } = await got_default(`${baseUrl}/${type}/list.htm`);
		const $ = load(response);
		const categoryName = $(".accordion .selected a").text().trim() || "最新动态";
		const list = $("#wp_news_w49 table tr").slice(1).toArray().map((tr) => {
			const $tr = $(tr);
			const cells = $tr.find("td");
			if (cells.length < 5) return null;
			const title = cells.eq(1).text().trim();
			const publisher = cells.eq(2).text().trim();
			const dateStr = cells.eq(3).text().trim();
			const onclick = $tr.attr("onclick");
			let link = "";
			if (onclick) {
				const match = onclick.match(/window\.location\.href='([^']+)';/);
				if (match) {
					link = match[1];
					if (!link.startsWith("http")) link = `${baseUrl}${link}`;
				}
			}
			return {
				title,
				link,
				pubDate: timezone(parseDate(dateStr), 8),
				author: publisher
			};
		}).filter((item) => item && item.link);
		const items = await Promise.all(list.map((item) => item ? cache_default.tryGet(item.link, async () => {
			try {
				const { data: response } = await got_default(item.link);
				const $ = load(response);
				let description = $(".wp_articlecontent").html() || $(".body-news-detail").html();
				description ||= item.title;
				item.description = description;
			} catch {
				item.description = item.title + " (获取详细内容失败)";
			}
			return item;
		}) : null));
		return {
			title: `南开大学计算机学院-${categoryName}`,
			link: `${baseUrl}/${type}/list.htm`,
			item: items
		};
	}
};
//#endregion
export { route };
