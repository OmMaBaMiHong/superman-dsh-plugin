import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/xjtu/std.tsx
const route = {
	path: "/std/:category?",
	categories: ["university"],
	example: "/xjtu/std/zytz",
	parameters: { category: "分类，见下表，默认为通知公告" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "科技在线",
	maintainers: ["nczitzk"],
	handler,
	description: `| 通知公告 | 重要通知 | 项目申报 | 成果申报 | 信息快讯 |
| -------- | -------- | -------- | -------- | -------- |
|          | zytz     | xmsb     | cgsb     | xxkx     |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const rootUrl = "http://std.xjtu.edu.cn";
	const currentUrl = `${rootUrl}/tzgg${category ? `/${category}` : ""}.htm`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(".c1017").toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${rootUrl}/${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		item.description = renderToString(/* @__PURE__ */ jsx(XjtuStdDescription, {
			description: content("#vsb_newscontent").html(),
			attachments: content("#vsb_newscontent").parent().next().next().next().html()
		}));
		item.pubDate = timezone(parseDate(content("#vsb_newscontent").parent().prev().prev().text().split("&nbsp", 1)[0], "YYYY年MM月DD日 HH:mm"), 8);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
const XjtuStdDescription = ({ description, attachments }) => /* @__PURE__ */ jsxs(Fragment, { children: [description ? raw(description) : null, attachments ? raw(attachments) : null] });
//#endregion
export { route };
