import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/ai-notice.ts
const route = {
	path: "/ai/:type?",
	categories: ["university"],
	example: "/nankai/ai/zxdt",
	parameters: { type: "栏目类型（若为空则默认为\"最新动态\"）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["ai.nankai.edu.cn", "ai.nankai.edu.cn/xwzx/:type.htm"],
		target: "/ai/:type?"
	}],
	name: "人工智能学院",
	maintainers: ["LMark"],
	description: `| 最新动态 | 学院公告 | 学生之窗 | 科研信息 | 本科生教学 | 党团园地 | 研究生招生 | 研究生教学 | 就业信息 | 国际交流 |
| -------- | -------- | -------- | -------- | ---------- | -------- | ---------- | ---------- | -------- | -------- |
| zxdt     | xygg     | xszc     | kyxx     | bksjx      | dtyd     | yjszs      | yjsjx      | jyxx     | gjjl     |`,
	url: "ai.nankai.edu.cn",
	handler: async (ctx) => {
		const { type = "zxdt" } = ctx.req.param();
		const baseUrl = "https://ai.nankai.edu.cn";
		const { data: response } = await got_default(`${baseUrl}/xwzx/${type}.htm`);
		const $ = load(response);
		const categoryName = {
			zxdt: "最新动态",
			xygg: "学院公告",
			xszc: "学生之窗",
			kyxx: "科研信息",
			bksjx: "本科生教学",
			dtyd: "党团园地",
			yjszs: "研究生招生",
			yjsjx: "研究生教学",
			jyxx: "就业信息",
			gjjl: "国际交流"
		}[type] || "最新动态";
		const list = $(".gage-list-news table tr").slice(1).toArray().map((tr) => {
			const cells = $(tr).find("td");
			if (cells.length < 3) return null;
			const titleCell = cells.eq(0);
			const sourceCell = cells.eq(1);
			const dateCell = cells.eq(2);
			const $titleLink = titleCell.find("a");
			const title = $titleLink.text().trim();
			let link = $titleLink.attr("href") || "";
			link = link && !link.startsWith("http") ? `${baseUrl}/${link}` : link;
			const dateStr = dateCell.text().trim();
			const pubDate = dateStr.includes("/") ? timezone(parseDate(dateStr, "YYYY/MM/DD"), 8) : timezone(parseDate(dateStr), 8);
			const source = sourceCell.text().trim();
			return {
				title,
				link,
				pubDate,
				author: source || "人工智能学院",
				description: ""
			};
		}).filter((item) => item && item.link && item.title);
		const items = await Promise.all(list.map((item) => item ? cache_default.tryGet(item.link, async () => {
			try {
				const { data: response } = await got_default(item.link);
				const $ = load(response);
				const $description = $(".v_news_content");
				if ($description.length > 0) $description.find("img").each((i, el) => {
					const $el = $(el);
					let src = $el.attr("src");
					if (src && !src.startsWith("http")) {
						src = `${baseUrl}${src}`;
						$el.attr("src", src);
					}
				});
				item.description = $description.html() || item.title;
			} catch {
				item.description = item.title + " (获取详细内容失败)";
			}
			return item;
		}) : null));
		return {
			title: `南开大学人工智能学院-${categoryName}`,
			link: `${baseUrl}/xwzx/${type}.htm`,
			item: items
		};
	}
};
//#endregion
export { route };
