import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import R from "node:zlib";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/foresightnews/util.tsx
const constants = {
	labelHot: "热门",
	labelImportant: "重要消息",
	defaultType: "article"
};
const params = {
	article: "article",
	event: "timeline",
	news: "news"
};
const rootUrl = "https://foresightnews.pro";
const apiRootUrl = "https://api.foresightnews.pro";
const imgRootUrl = "https://img.foresightnews.pro";
const icon = new URL("foresight.ico", rootUrl).href;
const image = new URL("vertical_logo.png", imgRootUrl).href;
const processItems = async (apiUrl, limit, ...parameters) => {
	let searchParams = { size: limit };
	for (const param of parameters) searchParams = {
		...searchParams,
		...param
	};
	const info = { column: "" };
	const { data: response } = await got_default(apiUrl, { searchParams });
	const buffer = Buffer.from(response.data?.list ?? response.data, "base64");
	let items = JSON.parse(String(R.inflateSync(buffer)));
	items = (items?.list ?? items).slice(0, limit).map((item) => {
		const sourceType = item.source_type ?? (item.source_link ? item.column?.title ? "article" : "news" : item.event_type ? "event" : constants.defaultType);
		item = item.source_type ? item[item.source_type] : item;
		const column = item.column?.title;
		info.column ||= column;
		const categories = [
			column,
			item.event_type,
			item.is_hot ? constants.labelHot : void 0,
			item.is_important ? item.important_tag?.name ?? constants.labelImportant : "",
			item.label,
			...item.tags?.map((c) => c.name) ?? []
		].filter((v, index, self) => v && self.indexOf(v) === index);
		const link = new URL(`${params[sourceType]}/detail/${item.id}`, rootUrl).href;
		return {
			title: item.title,
			link,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				raw(item.content ?? item.brief ?? ""),
				item.source_link ? /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("br", {}),
					/* @__PURE__ */ jsx("a", {
						href: item.source_link,
						children: "来源链接"
					}),
					/* @__PURE__ */ jsx("br", {})
				] }) : null,
				item.img ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", { src: item.img.split("?", 1)[0] }) }) : null
			] })),
			author: item.column?.title ?? item.author?.username ?? void 0,
			category: categories,
			guid: `foresightnews-${sourceType}#${item.id}`,
			pubDate: item.published_at ? parseDate(item.published_at * 1e3) : void 0,
			updated: item.last_update_at ? parseDate(item.last_update_at * 1e3) : void 0
		};
	});
	return {
		items,
		info
	};
};
//#endregion
export { rootUrl as a, processItems as i, icon as n, image as r, apiRootUrl as t };
