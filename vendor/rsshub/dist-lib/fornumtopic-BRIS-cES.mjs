import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import iconv from "iconv-lite";
//#region lib/routes/txrjy/fornumtopic.tsx
const rootUrl = "https://www.txrjy.com";
const route = {
	path: "/fornumtopic/:channel?",
	categories: ["bbs"],
	example: "/txrjy/fornumtopic",
	parameters: { channel: "频道的 id，见下表，默认为最新500个主题帖" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "论坛 频道",
	maintainers: ["Fatpandac"],
	handler,
	description: `| 最新 500 个主题帖 | 最新 500 个回复帖 | 最新精华帖 | 最新精华帖 | 一周热帖 | 本月热帖 |
| :---------------: | :---------------: | :--------: | :--------: | :------: | :------: |
|         1         |         2         |      3     |      4     |     5    |     6    |`
};
async function handler(ctx) {
	const channel = ctx.req.param("channel") ?? "1";
	const url = `${rootUrl}/c114-listnewtopic.php?typeid=${channel}`;
	const response = await got_default(url, { responseType: "buffer" });
	const $ = load(iconv.decode(response.data, "gbk"));
	const title = $("div.z > a").last().text();
	const list = $("tbody > tr").slice(0, 25).toArray().map((item) => ({
		title: $(item).find("td.title2").text(),
		link: new URL($(item).find("td.title2 > a").attr("href"), rootUrl).href,
		author: $(item).find("td.author").text(),
		pubDate: timezone(parseDate($(item).find("td.dateline").text(), "YYYY-M-D HH:mm"), 8),
		category: $(item).find("td.forum").text()
	})).filter((item) => item.title);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(item.link, { responseType: "buffer" });
		const content = load(iconv.decode(detailResponse.data, "gbk"));
		item.description = content("div.c_table").toArray().map((item) => {
			const contentHtml = content(item).find("td.t_f").find("div.a_pr").remove().end().html()?.replaceAll(/(<img.*?) src="[^"]*"(.*?>)/g, "$1$2").replaceAll(/(<img.*?)zoomfile(.*?>)/g, "$1src$2");
			const pattlHtml = content(item).find("div.pattl").html()?.replaceAll(/(<img.*?) src="[^"]*"(.*?>)/g, "$1$2").replaceAll(/(<img.*?)zoomfile(.*?>)/g, "$1src$2");
			return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h4", { children: content(item).find("a.xw1").text().trim() }),
				contentHtml ? raw(contentHtml) : null,
				pattlHtml ? raw(pattlHtml) : null,
				/* @__PURE__ */ jsx("hr", {})
			] }));
		}).join("\n");
		return item;
	})));
	return {
		title: `通信人家园 - 论坛 ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
