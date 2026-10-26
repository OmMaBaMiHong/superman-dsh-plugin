import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/tongji/sse/_article.ts
async function getArticle(item) {
	const data = (await got_default({
		method: "get",
		url: item.link
	})).data;
	const $ = load(data);
	const title = $("div.view-title").text();
	const content = $("#vsb_content").html();
	$("[name=\"_newscontent_fromname\"] ul a").each((_, e) => {
		const href = $(e).attr("href");
		if (href.startsWith("/")) $(e).attr("href", new URL(href, item.link).href);
	});
	item.title = title;
	item.description = content + ($("ul[style]").length ? $("ul[style]").html() : "");
	return item;
}
//#endregion
//#region lib/routes/tongji/sse/notice.ts
const route = {
	path: "/sse/:type?",
	categories: ["university"],
	example: "/tongji/sse/xytz",
	parameters: { type: "通知类型，默认为 `xytz`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "软件学院通知",
	maintainers: ["sgqy"],
	handler,
	description: `| 本科生通知 | 研究生通知 | 教工通知 | 全体通知 | 学院通知 | 学院新闻 | 学院活动 |
| ---------- | ---------- | -------- | -------- | -------- | -------- | -------- |
| bkstz      | yjstz      | jgtz     | qttz     | xytz     | xyxw     | xyhd     |

注意: \`qttz\` 与 \`xytz\` 在原网站等价.`
};
async function handler(ctx) {
	const baseUrl = "https://sse.tongji.edu.cn";
	const type = ctx.req.param("type") || "xytz";
	const listUrl = `${baseUrl}/xxzx/${[
		"bkstz",
		"yjstz",
		"jgtz",
		"qttz"
	].includes(type) ? `xytz/${type}` : type}.htm`;
	const data = (await got_default({
		method: "get",
		url: listUrl
	})).data;
	const $ = load(data);
	const detailUrls = $(".data-list li").toArray().map((item) => {
		item = $(item);
		const a = item.find("a");
		return {
			title: a.text(),
			link: new URL(a.attr("href"), baseUrl).href,
			pubDate: parseDate(item.find(".data-list-time").text(), "YYYY-MM-DD")
		};
	});
	return {
		title: "同济大学软件学院",
		link: listUrl,
		item: await Promise.all(detailUrls.map((item) => cache_default.tryGet(item.link, () => getArticle(item))))
	};
}
//#endregion
export { route };
