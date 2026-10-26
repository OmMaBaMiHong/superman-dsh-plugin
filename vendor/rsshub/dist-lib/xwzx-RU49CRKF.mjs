import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/jlu/ccst/xwzx/index.ts
const route = {
	path: "/ccst/xwzx/:category",
	categories: ["university"],
	example: "/jlu/ccst/xwzx/gsl",
	radar: [{ source: [
		"ccst.jlu.edu.cn/xwzx/gsl.htm",
		"ccst.jlu.edu.cn/xwzx/xstd.htm",
		"ccst.jlu.edu.cn/xwzx/xytz.htm",
		"ccst.jlu.edu.cn/xwzx/xyxw.htm",
		"ccst.jlu.edu.cn/xwzx/zsjy.htm"
	] }],
	name: "吉林大学计算机科学与技术学院 - 新闻中心",
	maintainers: ["mayouxi"],
	handler,
	url: "ccst.jlu.edu.cn"
};
async function handler(ctx) {
	const category = ctx.req.param("category");
	const baseUrl = "https://ccst.jlu.edu.cn";
	const $ = load((await got_default(`${baseUrl}/xwzx/${category}.htm`)).body);
	const list = $(".section.container .main .list3 ul li");
	const titleSuffix = {
		gsl: "公示栏",
		xstd: "学生天地",
		xytz: "学院通知",
		xyxw: "学院新闻",
		zsjy: "招生就业"
	}[category] || "新闻中心";
	return {
		title: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,
		link: baseUrl,
		description: `吉林大学计算机科学与技术学院 - 新闻中心${titleSuffix}`,
		item: list.toArray().map((item) => {
			const el = $(item);
			const linkEl = el.find("a");
			const dateStr = el.find(".date").text().trim();
			const title = linkEl.text().trim();
			const rawLink = linkEl.attr("href").replaceAll("..", "");
			return {
				title,
				link: `${baseUrl}${encodeURI(rawLink)}`,
				pubDate: new Date(dateStr)
			};
		})
	};
}
//#endregion
export { route };
