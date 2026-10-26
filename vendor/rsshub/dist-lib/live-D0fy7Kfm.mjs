import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/wallstreetcn/live.tsx
const titles = {
	global: "要闻",
	"a-stock": "A股",
	"us-stock": "美股",
	"hk-stock": "港股",
	forex: "外汇",
	commodity: "商品",
	financing: "理财"
};
const route = {
	path: "/live/:category?/:score?",
	categories: ["finance"],
	example: "/wallstreetcn/live",
	parameters: {
		category: "快讯分类，默认`global`，见下表",
		score: "快讯重要度，默认`1`全部快讯，可设置为`2`只看重要的"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["wallstreetcn.com/live/:category", "wallstreetcn.com/"],
		target: "/live/:category?"
	}],
	name: "实时快讯",
	maintainers: ["nczitzk"],
	handler,
	description: `| 要闻   | A 股    | 美股     | 港股     | 外汇  | 商品      | 理财      |
| ------ | ------- | -------- | -------- | ----- | --------- | --------- |
| global | a-stock | us-stock | hk-stock | forex | commodity | financing |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "global";
	const score = ctx.req.param("score") ?? 1;
	const rootUrl = "https://wallstreetcn.com";
	const apiRootUrl = "https://api-one.wallstcn.com";
	const currentUrl = `${rootUrl}/live/${category}`;
	const items = (await got_default({
		method: "get",
		url: `${apiRootUrl}/apiv1/content/lives?channel=${category}-channel&limit=${ctx.req.query("limit") ?? 100}`
	})).data.data.items.filter((item) => item.score >= score).map((item) => ({
		link: item.uri,
		title: item.title || item.content_text,
		pubDate: parseDate(item.display_time * 1e3),
		author: item.author?.display_name ?? "",
		description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			item.content ? raw(item.content) : null,
			item.content_more ? raw(item.content_more) : null,
			item.images?.length ? item.images.map((image) => /* @__PURE__ */ jsx("img", {
				src: image.uri,
				width: image.width,
				height: image.height
			})) : null
		] }))
	}));
	return {
		title: `华尔街见闻 - 实时快讯 - ${titles[category]}`,
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
