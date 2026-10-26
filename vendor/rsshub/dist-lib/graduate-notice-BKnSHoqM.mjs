import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/nankai/graduate-notice.ts
const route = {
	path: "/graduate/:type?",
	categories: ["university"],
	example: "/nankai/graduate/zxdt",
	parameters: { type: "栏目编号（若为空则默认为\"zxdt\"）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["graduate.nankai.edu.cn", "graduate.nankai.edu.cn/:type/list.htm"],
		target: "/graduate/:type?"
	}],
	name: "研究生院",
	maintainers: ["ladeng07"],
	description: `| 最新动态 | 综合信息 | 招生工作 | 培养管理 | 国际交流 | 学科建设 | 学位管理 |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| zxdt     | 82       | 83       | 84       | 85       | 86       | 87       |`,
	url: "graduate.nankai.edu.cn",
	handler: async (ctx) => {
		const { type = "zxdt" } = ctx.req.param();
		const baseUrl = "https://graduate.nankai.edu.cn";
		const { data: response } = await got_default(`${baseUrl}/${type}/list.htm`);
		const $ = load(response);
		const categoryName = {
			zxdt: "最新动态",
			"82": "综合信息",
			"83": "招生工作",
			"84": "培养管理",
			"85": "国际交流",
			"86": "学科建设",
			"87": "学位管理"
		}[type] || "最新动态";
		const list = $(".newslist li").not("#wp_paging_w6 li").toArray().map((li) => {
			const $li = $(li);
			const $link = $li.find(".title").find("a");
			const $timeDiv = $li.find(".time");
			const title = $link.attr("title");
			let link = $link.attr("href") || "";
			link = link && !link.startsWith("http") ? `${baseUrl}${link}` : link;
			const pubDate = timezone(parseDate($timeDiv.text().trim(), "YYYY-MM-DD"), 8);
			return {
				title,
				link,
				pubDate,
				author: "研究生院",
				description: ""
			};
		}).filter((item) => item && item.link && item.title);
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			try {
				const { data: response } = await got_default(item.link);
				const $ = load(response);
				const $description = $(".wp_articlecontent");
				if ($description.length > 0) {
					$description.find("a").each((i, el) => {
						const $el = $(el);
						const href = $el.attr("href");
						if (href && !href.startsWith("http")) if (href.startsWith("/")) $el.attr("href", `${baseUrl}${href}`);
						else $el.attr("href", `${baseUrl}/${href}`);
					});
					$description.find("img").each((i, el) => {
						const $el = $(el);
						let src = $el.attr("src");
						if (src && !src.startsWith("http")) {
							src = src.startsWith("/") ? `${baseUrl}${src}` : `${baseUrl}/${src}`;
							$el.attr("src", src);
						}
					});
					$description.find(".wp_pdf_player").each((i, el) => {
						const $el = $(el);
						const pdfSrc = $el.attr("pdfsrc");
						const sudyfileAttr = ($el.attr("sudyfile-attr") || "{}").replaceAll("'", "\"");
						try {
							const fileName = JSON.parse(sudyfileAttr).title || "未命名文件.pdf";
							if (pdfSrc) {
								let pdfUrl = pdfSrc;
								if (!pdfUrl.startsWith("http")) pdfUrl = `${baseUrl}${pdfUrl}`;
								$el.replaceWith(`<p><a href="${pdfUrl}" target="_blank">📄 ${fileName}</a></p>`);
							}
						} catch {}
					});
				}
				item.description = $description.html() || item.title;
			} catch {
				item.description = item.title + " (获取详细内容失败)";
			}
			return item;
		})));
		return {
			title: `南开大学研究生院-${categoryName}`,
			link: `${baseUrl}/${type}/list.htm`,
			item: items
		};
	}
};
//#endregion
export { route };
