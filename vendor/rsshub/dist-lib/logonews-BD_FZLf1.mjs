import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { r as getSubPath } from "./common-utils-xJr7JYuG.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/logonews/index.tsx
const route = {
	path: [
		"/work/tags/:tag",
		"/tag/:tag",
		"*"
	],
	radar: [{ source: ["logonews.cn/work/tags/:tag"] }],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "logonews.cn/",
	description: "如 [中国 - 标志情报局](https://www.logonews.cn/tag/china) 的 URL 为 `https://www.logonews.cn/tag/china`，可得路由为 [`/logonews/tag/china`](https://rsshub.app/logonews/tag/china)。"
};
async function handler(ctx) {
	const params = getSubPath(ctx);
	const isWork = params.indexOf("/work") === 0;
	const currentUrl = `https://www.logonews.cn${params === "/" ? "" : params}`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	let items = $(isWork ? "h2 a" : "a.article-link").slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 25).toArray().map((item) => {
		item = $(item);
		return { link: item.attr("href") };
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		content(".iconfont").remove();
		content("img[data-src]").each((_, el) => {
			content(el).attr("src", content(el).attr("data-src").replace(/_logonews/, ""));
		});
		item.title = content("title").text();
		item.author = content(".author-links").text();
		item.pubDate = parseDate(content("meta[property=\"og:release_date\"]").attr("content"));
		item.category = content("a.category_link, a[rel=\"tag\"]").toArray().map((c) => content(c).text().replaceAll(" · ", ""));
		item.description = renderDescription(isWork, content("meta[property=\"og:image\"]").attr("content"), content(".This_Article_content, .w_info").html());
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
const renderDescription = (isWork, image, description) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [isWork ? /* @__PURE__ */ jsx("img", { src: image }) : null, description ? raw(description) : null] }));
//#endregion
export { route };
