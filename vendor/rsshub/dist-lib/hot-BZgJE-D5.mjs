import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/pku/bbs/hot.ts
const route = {
	path: "/bbs/hot",
	categories: ["university"],
	example: "/pku/bbs/hot",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["bbs.pku.edu.cn/v2/hot-topic.php", "bbs.pku.edu.cn/"] }],
	name: "北大未名 BBS 全站十大",
	maintainers: ["wooddance"],
	handler,
	url: "bbs.pku.edu.cn/v2/hot-topic.php",
	description: `::: warning
论坛部分帖子正文内容的获取需要用户登录后的 Cookie 值，详情见部署页面的配置模块。
:::`
};
async function handler() {
	const cookie = config.pkubbs.cookie;
	const headers = {};
	if (cookie) headers.cookie = cookie;
	const $ = load((await got_default("https://bbs.pku.edu.cn/v2/hot-topic.php", { headers })).body);
	const listItems = $("#list-content .list-item").toArray().map((element) => ({
		url: new URL($(element).find("> a.link").attr("href"), "https://bbs.pku.edu.cn/v2/").href,
		title: $(element).find(".title").text()
	})).slice(0, 10);
	return {
		title: "北大未名BBS 全站十大",
		link: "https://bbs.pku.edu.cn/v2/hot-topic.php",
		description: "北大未名BBS 全站热门话题前十名",
		item: await Promise.all(listItems.map(({ url, title }) => cache_default.tryGet(url, async () => {
			try {
				const $ = load((await got_default(url, { headers })).body);
				const date = $(".post-card:first-child .sl-triangle-container .down-list span").text() || $(".post-card:first-child .sl-triangle-container .title span").text();
				return {
					title,
					description: $(".post-card:first-child .content").html(),
					link: url,
					guid: url,
					pubDate: timezone(parseDate(date, "发表于YYYY-MM-DD HH:mm:ss"), 8)
				};
			} catch {
				return {
					title,
					link: url,
					guid: url
				};
			}
		})))
	};
}
//#endregion
export { route };
