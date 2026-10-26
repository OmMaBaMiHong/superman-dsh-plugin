import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/fanxinzhui/index.tsx
const route = {
	path: "/",
	name: "最近更新",
	url: "fanxinzhui.com/lastest",
	maintainers: ["nczitzk"],
	handler,
	example: "/fanxinzhui",
	categories: ["multimedia"],
	radar: [{
		source: ["fanxinzhui.com/lastest"],
		target: "/"
	}]
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30;
	const rootUrl = "https://www.fanxinzhui.com";
	const currentUrl = new URL("lastest", rootUrl).href;
	const { data: response } = await got_default(currentUrl);
	const $ = load(response);
	let items = $("a.la").slice(0, limit).toArray().map((item) => {
		item = $(item);
		const season = item.find("span.season").text();
		const name = item.find("span.name").text();
		const link = new URL(item.prop("href"), rootUrl).href;
		return {
			title: `${season} ${name}`,
			link,
			guid: `${link}#${season}`,
			pubDate: timezone(parseDate(item.find("span.time").text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: detailResponse } = await got_default(item.link);
		const content = load(detailResponse);
		item.author = void 0;
		item.category = [];
		content("div.info ul li").each((_, el) => {
			el = content(el);
			const key = el.find("span").text().split(/:/, 1)[0];
			const value = el.contents().last().text().trim();
			if (key === "类型") item.category = [...item.category, ...value.split(/\//)];
			else if (key === "首播日期") return;
			else {
				item.author = `${item.author ? `${item.author}/` : ""}${value}`;
				item.category = [...item.category, ...value.split(/\//)].filter((c) => c !== "等");
			}
		});
		content("div.image").each((_, el) => {
			el = content(el);
			const image = el.find("img").prop("src");
			el.replaceWith(renderDescription(image ? [{
				src: image.replace(/@\d+,\d+\.\w+$/, ""),
				alt: content("div.resource_title h2").text()
			}] : void 0));
		});
		content("a.password").each((_, el) => {
			el = content(el);
			el.replaceWith(el.text());
		});
		item.description = content("div.middle_box").html();
		item.enclosure_url = content("p.way span a").prop("href");
		return item;
	})));
	const title = $("title").text();
	const image = new URL($("img.logo").prop("src"), rootUrl).href;
	return {
		item: items,
		title,
		link: currentUrl,
		description: $("meta[name=\"description\"]").prop("content"),
		language: "zh",
		image,
		author: title.split(/_/).pop(),
		allowEmpty: true
	};
}
const renderDescription = (images) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: images?.map((image, index) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, `${image.src}-${index}`) : null) }));
//#endregion
export { route };
