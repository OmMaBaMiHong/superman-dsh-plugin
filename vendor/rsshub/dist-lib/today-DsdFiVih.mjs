import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/hitwh/today.ts
const baseUrl = "https://today.hitwh.edu.cn";
const route = {
	path: "/today",
	categories: ["university"],
	example: "/hitwh/today",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hitwh.edu.cn/1024/list.htm", "hitwh.edu.cn/"] }],
	name: "今日工大 - 通知公告",
	maintainers: ["raptazure"],
	handler,
	url: "hitwh.edu.cn/1024/list.htm"
};
async function handler() {
	const $ = load((await got_default(`${baseUrl}/1024/list.htm`)).data);
	const type = (filename) => filename.split(".").pop();
	const links = $(".list_list_wrap #wp_news_w10002 ul > li").toArray().map((el) => ({
		pubDate: timezone(parseDate($(el).find(".news-time2").text()), 8),
		link: new URL($(el).find("a").attr("href"), baseUrl).href,
		title: $(el).find("a").text()
	}));
	return {
		title: "哈尔滨工业大学（威海）通知公告",
		link: `${baseUrl}/1024/list.htm`,
		item: await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
			if (type(item.link) === "htm") try {
				const { data } = await got_default(item.link);
				const $ = load(data);
				item.description = $("div.wp_articlecontent").html() && $("div.wp_articlecontent").html().replaceAll("src=\"/", () => `src="${baseUrl}/`).replaceAll("href=\"/", () => `href="${baseUrl}/`).trim();
				return item;
			} catch {
				item.description = "请进行统一身份认证之后再访问";
				return item;
			}
			item.description = "此链接为文件，点击以下载";
			return item;
		})))
	};
}
//#endregion
export { route };
