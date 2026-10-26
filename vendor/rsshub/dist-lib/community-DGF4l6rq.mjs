import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/modelscope/community.tsx
const route = {
	path: "/community",
	categories: ["programming"],
	example: "/modelscope/community",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["community.modelscope.cn/"] }],
	name: "DevPress 官方社区",
	maintainers: ["TonyRL"],
	handler,
	url: "community.modelscope.cn/"
};
const renderDescription = (thumb, quote, content) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	thumb ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: thumb }), /* @__PURE__ */ jsx("br", {})] }) : null,
	quote ? /* @__PURE__ */ jsx("blockquote", { children: quote }) : null,
	content ? /* @__PURE__ */ jsx(Fragment, { children: raw(content) }) : null
] }));
async function handler(ctx) {
	const baseUrl = "https://community.modelscope.cn";
	const { data } = await got_default.post(`${baseUrl}/v1/namespace_page/article`, { json: {
		id: 142373,
		notInMediaAidList: [],
		pageNum: 1,
		pageSize: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30
	} });
	const articles = data.data.content.map((c) => ({
		title: c.content.name,
		description: c.content.desc,
		author: c.nickname,
		link: `${baseUrl}/${c.content.id}.html`,
		pubDate: timezone(parseDate(c.content.createdTime), 8),
		category: c.content.externalData.tags.map((t) => t.name),
		thumb: c.content.thumb
	}));
	return {
		title: "ModelScope魔搭社区-DevPress官方社区",
		description: "ModelScope魔搭社区 DevPress官方社区-ModelScope旨在打造下一代开源的模型即服务共享平台，为泛AI开发者提供灵活、易用、低成本的一站式模型服务产品，让模型应用更简单。",
		image: "https://g.alicdn.com/sail-web/maas/0.8.10/favicon/128.ico",
		link: baseUrl,
		item: await Promise.all(articles.map((item) => cache_default.tryGet(item.link, async () => {
			const { data } = await got_default(item.link);
			const $ = load(data);
			const initialData = JSON.parse($("script").text().match(/window\.__INITIAL_STATE__\s*=\s*(\{.*?\});/)[1]);
			item.description = renderDescription(item.thumb, item.description, initialData.pageData.detail.ext.content);
			return item;
		})))
	};
}
//#endregion
export { route };
