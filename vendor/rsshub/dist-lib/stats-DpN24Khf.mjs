import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gov/stats/index.tsx
const renderDescription = ({ description, attachments }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description ? raw(description) : null, attachments?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("p", { children: "附件：" }),
	/* @__PURE__ */ jsx("ul", { children: attachments.map((attachment, index) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx("a", {
		href: attachment.link,
		children: attachment.name
	}) }, `${attachment.link}-${index}`)) })
] }) : null] }));
const route = {
	path: "/:path{.+}?",
	name: "通用",
	url: "www.stats.gov.cn",
	categories: ["government"],
	maintainers: [
		"bigfei",
		"nczitzk",
		"reply2future"
	],
	example: "/gov/stats/sj/zxfb",
	parameters: { path: "路径，默认为 统计数据 > 最新发布" },
	handler,
	radar: [{
		source: ["www.stats.gov.cn/*path"],
		target: "/:path"
	}],
	description: `::: tip
路径处填写对应页面 URL 中 \`http://www.stats.gov.cn/\` 后的字段。下面是一个例子。

若订阅 [数据 > 数据解读](http://www.stats.gov.cn/sj/sjjd/)
则将对应页面 URL \`http://www.stats.gov.cn/sj/sjjd/\` 中 \`http://www.stats.gov.cn/\` 后的字段 \`sj/sjjd\` 作为路径填入。
此时路由为 [\`/gov/stats/sj/sjjd\`](https://rsshub.app/gov/stats/sj/sjjd)

若订阅 [新闻 > 时政要闻 > 中央精神](http://www.stats.gov.cn/xw/szyw/zyjs/)
则将对应页面 URL \`http://www.stats.gov.cn/xw/szyw/zyjs/\` 中 \`http://www.stats.gov.cn/\`
后的字段 \`xw/szyw/zyjs\` 作为路径填入。此时路由为 [\`/gov/stats/xw/szyw/zyjs\`](https://rsshub.app/gov/stats/xw/szyw/zyjs)
:::`
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 15;
	const rootUrl = "http://www.stats.gov.cn";
	const { headers } = await rofetch.raw(rootUrl);
	const sid = headers?.getSetCookie().find((s) => s.startsWith("wzws_sessionid="))?.split(";", 1)[0];
	const { path = "sj/zxfb" } = ctx.req.param();
	const pathname = `/${path}`;
	const currentUrl = `${rootUrl}${pathname.endsWith("/") ? pathname : pathname + "/"}`;
	const $ = load(await rofetch(currentUrl, { headers: {
		Cookie: sid,
		Referer: currentUrl
	} }));
	let items = $($("a.pchide").length === 0 ? "a[title]" : ".list-content a.pchide").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.attr("title"),
			link: new URL(item.attr("href"), currentUrl).href
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await rofetch(item.link, { headers: {
			Cookie: sid,
			Referer: rootUrl
		} });
		const content = load(detailResponse);
		if (/news\.cn|www\.gov\.cn/.test(item.link)) {
			if (content(".year").text()) {
				item.pubDate = timezone(parseDate(`${content(".year").text()}/${content(".day").text()} ${content(".time").text()}`, "YYYY/MM/DD HH:mm:ss"), 8);
				item.author = content(".source").text().replace(/来源：/, "").trim();
			} else {
				content(".pages_print").remove();
				const info = content(".info, .pages-date").text().split("来源：");
				item.pubDate = timezone(parseDate(info[0].trim()), 8);
				item.author = info.pop();
			}
			item.title ||= content("h1").first().text() || content("h2").first().text();
			item.description = content("#detail, .xlcontent, .pages_content").html();
			return item;
		}
		item.author = detailResponse.match(/来源：(.*?)</)?.[1]?.trim();
		content(".pchide").remove();
		item.title ||= content("div.detail-title h1").text();
		item.pubDate = timezone(parseDate(content("div.detail-title-des h2 p, .info").first().text().trim()), 8);
		item.description = renderDescription({
			description: content(".TRS_Editor").html() || content(".TRS_UEDITOR").html(),
			attachments: content("a[oldsrc]").toArray().map((a) => {
				a = $(a);
				return {
					link: new URL(a.attr("href"), item.link).href,
					name: a.text().trim()
				};
			})
		});
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
