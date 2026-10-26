import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/upc/jwc.ts
const handler = async (ctx) => {
	const { type = "tzgg" } = ctx.req.param();
	const baseUrl = "https://jwc.upc.edu.cn";
	const { data: response } = await got_default(`${baseUrl}/${type}/list.htm`);
	const $ = load(response);
	const list = $("ul.news_list").find("li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a").first();
		let linkStr = a.attr("href");
		linkStr = linkStr.replace("http://", "https://");
		if (!a.attr("href").startsWith("https://")) linkStr = `${baseUrl}${a.attr("href")}`;
		return {
			title: a.text(),
			link: linkStr,
			pubDate: timezone(parseDate(item.find(".news_meta").text()), 8)
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const { data: response } = await got_default(item.link);
			const $ = load(response);
			if (item.link.includes("news.upc.edu.cn")) {
				item.description = $(".v_news_content").html();
				item.author = $(".nr-zz h2").html();
			} else if (item.link.includes("app.upc.edu.cn")) {
				const scriptContent = $("body script").first().html();
				let dataObj = null;
				if (scriptContent) {
					const match = scriptContent.match(/data\s*:\s*function\s*\(\)\s*\{\s*return\s*\{[^}]*data\s*:\s*(\{[\s\S]*?\})/);
					if (match && match[1]) {
						const dataStr = match[1];
						dataObj = JSON.parse(dataStr);
					}
				}
				item.description = dataObj.content;
				item.author = dataObj.author;
			} else {
				item.description = $(".read").first().html() || "无法获取正文内容，请手动访问";
				item.author = $(".arti_publisher").html();
			}
		} catch {
			item.description = "正文内容获取失败";
		}
		return item;
	})));
	return {
		title: `${$("title").text()}-教务处通知-中国石油大学（华东）`,
		link: `${baseUrl}/${type}/list.htm`,
		item: items
	};
};
const route = {
	path: "/jwc/:type?",
	categories: ["university"],
	example: "/upc/jwc/tzgg",
	parameters: { type: "分类，见下表，其值与对应网页url路径参数一致，默认为所有通知" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["jwc.upc.edu.cn", "jwc.upc.edu.cn/:type/list.htm"],
		target: "/jwc/:type?"
	}],
	name: "教务处",
	maintainers: ["sddzhyc"],
	description: `| 所有通知 | 教学・运行 | 学业・学籍 | 教学・研究 | 课程・教材 | 实践・教学 | 创新・创业 | 语言・文字 | 继续・教育 | 本科・招生 |
| -------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- | ---------- |
| tzgg     | 18519      | 18520      | 18521      | 18522      | 18523      | 18524      | yywwz      | jxwjy      | bkwzs      |`,
	url: "jwc.upc.edu.cn/tzgg/list.htm",
	handler
};
//#endregion
export { route };
