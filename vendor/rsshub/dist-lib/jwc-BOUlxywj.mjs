import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ecnu/jwc.ts
const type = (filename) => filename.split(".").pop();
const route = {
	path: "/jwc",
	categories: ["university"],
	example: "/ecnu/jwc",
	radar: [{
		source: ["www.jwc.ecnu.edu.cn"],
		target: "/tzgg"
	}, {
		source: ["www.ecnu.edu.cn"],
		target: "/tzgg"
	}],
	name: "教务处通知",
	maintainers: ["markbang"],
	handler: async () => {
		const baseUrl = "http://www.jwc.ecnu.edu.cn/";
		const $ = load((await got_default(`${baseUrl}tzggwwxsgg/list.htm`)).data);
		const links = $(".col_news_con ul.news_list > li").toArray().map((el) => ({
			pubDate: timezone(parseDate($(el).find(".news_date").text()), 8),
			link: new URL($(el).find("a").attr("href"), baseUrl).href,
			title: $(el).find("a").text()
		}));
		return {
			title: "教务处通知",
			link: "http://www.jwc.ecnu.edu.cn/tzggwwxsgg/list.htm",
			item: await Promise.all(links.map((item) => cache_default.tryGet(item.link, async () => {
				if (type(item.link) === "htm") try {
					const { data } = await got_default(item.link);
					item.description = load(data)("div.article")?.html()?.replaceAll("src=\"/", () => `src="${baseUrl}/`)?.replaceAll("href=\"/", () => `href="${baseUrl}/`)?.trim();
					return item;
				} catch {
					item.description = "请进行统一身份认证之后再访问";
					return item;
				}
				item.description = "点击认证后访问内容";
				return item;
			})))
		};
	}
};
//#endregion
export { route };
