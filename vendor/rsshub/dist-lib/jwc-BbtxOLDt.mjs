import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/sjtu/jwc.ts
const urlRoot = "https://jwc.sjtu.edu.cn";
async function getFullArticle(link) {
	const response = await got_default(link);
	if (!response) return null;
	const $ = load(response.body);
	const content = $(".content-con");
	if (content.length === 0) return null;
	content.find("img").each((_, e) => {
		const relativeLink = $(e).attr("src");
		const absLink = new URL(relativeLink, urlRoot).href;
		$(e).attr("src", absLink);
	});
	content.find("a").each((_, e) => {
		const relativeLink = $(e).attr("href");
		const absLink = new URL(relativeLink, urlRoot).href;
		$(e).attr("href", absLink);
	});
	return content.html() + ($(".Newslist2").length ? $(".Newslist2").html() : "");
}
const route = {
	path: "/jwc/:type?",
	categories: ["university"],
	example: "/sjtu/jwc",
	parameters: { type: "默认为 notice" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "教务处通知公告",
	maintainers: ["SeanChao"],
	handler,
	description: `| 新闻中心 | 通知通告 | 教学运行  | 注册学务 | 研究办 | 教改办 | 综合办 | 语言文字 | 工会与支部 | 通识教育 | 面向学生的通知 |
| -------- | -------- | --------- | -------- | ------ | ------ | ------ | -------- | ---------- | -------- | -------------- |
| news     | notice   | operation | affairs  | yjb    | jgb    | zhb    | language | party      | ge       | students       |`
};
async function handler(ctx) {
	const type = ctx.req.param("type") ?? "notice";
	const config = {
		all: {
			section: "通知通告",
			link: "/xwtg/tztg.htm"
		},
		news: {
			link: "/xwtg/xwzx.htm",
			section: "新闻中心"
		},
		notice: {
			link: "/xwtg/tztg.htm",
			section: "通知通告"
		},
		operation: {
			link: "/xwtg/jxyx.htm",
			section: "教学运行"
		},
		affairs: {
			link: "/xwtg/zcxw.htm",
			section: "注册学务"
		},
		yjb: {
			link: "/xwtg/yjb.htm",
			section: "研究办"
		},
		jgb: {
			link: "/xwtg/jgb.htm",
			section: "教改办"
		},
		zhb: {
			link: "/xwtg/zhb.htm",
			section: "综合办"
		},
		language: {
			link: "/xwtg/yywz.htm",
			section: "语言文字"
		},
		party: {
			link: "/xwtg/ghyzb.htm",
			section: "工会与支部"
		},
		ge: {
			link: "/xwtg/tsjy.htm",
			section: "通识教育"
		},
		students: {
			link: "/index/mxxsdtz.htm",
			section: "面向学生的通知"
		}
	};
	const sectionLink = urlRoot + config[type].link;
	const $ = load((await got_default({
		method: "get",
		url: sectionLink
	})).body);
	const out = await Promise.all($("body > div.list-box > div.container > div > div.ny_right > div > div.ny_right_con > div > ul").find("li").toArray().map((e) => {
		const info = $(e).find(".wz");
		const relativeLink = info.find("a").attr("href");
		const link = new URL(relativeLink, sectionLink).href;
		const title = info.find("a > h2").text();
		const timeElement = $(e).find(".sj");
		const day = timeElement.find("h2").text();
		const pubDate = parseDate(`${timeElement.find("p").text()}.${day}`, "YYYY.MM.DD");
		return cache_default.tryGet(link, async () => {
			const description = await getFullArticle(link);
			return {
				title,
				link,
				pubDate,
				description
			};
		});
	}));
	return {
		title: "上海交通大学教务处 " + config[type].section,
		link: sectionLink,
		item: out
	};
}
//#endregion
export { route };
