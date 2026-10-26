import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/loltw/news.tsx
const route = {
	path: "/news/:category?",
	categories: ["game"],
	example: "/loltw/news",
	parameters: { category: "新闻分类，置空为全部新闻" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "台服新闻",
	maintainers: ["hoilc"],
	handler,
	description: `| 活动  | 资讯 | 系统   | 电竞   | 版本资讯 | 战棋资讯 |
| ----- | ---- | ------ | ------ | -------- | -------- |
| event | info | system | esport | patch    | TFTpatch |`
};
async function handler(ctx) {
	const category = ctx.req.param("category") ?? "";
	const baseUrl = "https://lol.garena.tw";
	const list = (await got_default(`${baseUrl}/api/news/search?category=${category}`)).data.data.news.map((item) => ({
		guid: item.id,
		title: item.title,
		author: "Garena",
		link: `${baseUrl}/news/articles/${item.id}`,
		pubDate: parseDate(item.updated_at * 1e3)
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default(`${baseUrl}/api/news/detail?news_id=${item.guid}`);
		item.description = renderToString(/* @__PURE__ */ jsx(LoltwNewsDescription, {
			img: detailResponse.data.data.news_detail.img,
			content: detailResponse.data.data.news_detail.content
		}));
		return item;
	})));
	return {
		title: "英雄联盟 - 台服新闻",
		link: category ? `${baseUrl}/news/${category}` : `${baseUrl}/news`,
		item: items
	};
}
const LoltwNewsDescription = ({ img, content }) => /* @__PURE__ */ jsxs("div", { children: [img ? /* @__PURE__ */ jsx("img", {
	style: "max-width: 100%",
	src: img
}) : null, content ? raw(content) : null] });
//#endregion
export { route };
