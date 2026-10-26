import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/mcmod/index.tsx
const render = (mod) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", {
		src: mod.pic,
		referrerpolicy: "no-referrer"
	}),
	mod.label.map((label) => /* @__PURE__ */ jsx("p", { children: label })),
	mod.support?.length ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: "支持的MC版本: " }), /* @__PURE__ */ jsx("ul", { children: mod.support.map((support) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsx("b", { children: support.label }), support.versions] })) })] }) : null,
	/* @__PURE__ */ jsx("hr", { style: "height: 2px; background-color: #e7e7e7; border: 0 none;" })
] }));
const route = {
	path: "/:type",
	categories: ["game"],
	example: "/mcmod/new",
	parameters: { type: "查询类型，详见下表" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "最新MOD",
	maintainers: ["hualiong"],
	description: `\`:type\` 类型可选如下

| 随机显示 MOD | 最新收录 MOD | 最近编辑 MOD |
| ------------ | ------------ | ------------ |
| random       | new          | edit         |`,
	handler: async (ctx) => {
		const type = ctx.req.param("type");
		const $get = rofetch.create({ baseURL: "https://www.mcmod.cn" });
		const $ = load(await $get("/"));
		const typeName = $(`div.left > ul > li[i='${type}']`).attr("title");
		const list = $(`#indexNew_${type} > .block`).toArray().map((item) => {
			const each = $(item);
			const time = each.find("div .time");
			return {
				title: each.find("div > .name > a").text(),
				image: each.find("img").attr("src")?.split("@", 1)[0],
				link: each.children("a").attr("href"),
				pubDate: time.attr("title") && timezone(parseDate(time.attr("title").slice(6), "YYYY-MM-DD HH:mm:ss"), 8)
			};
		});
		const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await $get(item.link));
			item.author = $(".author li").toArray().map((item) => {
				const each = $(item);
				const name = each.find(".name a");
				return {
					name: name.text(),
					url: "https://www.mcmod.cn" + name.attr("href"),
					avatar: each.find(".avatar img").attr("src")?.split("?", 1)[0]
				};
			});
			const html = $(".common-text[data-id=\"1\"]").html();
			const support = $(".mcver > ul > ul").toArray().map((e) => {
				const ul = $(e);
				return {
					label: ul.children("li:first-child").text(),
					versions: ul.children("li:not(:first-child)").toArray().map((e) => $(e).text()).join("，")
				};
			});
			item.description = render({
				pic: "https:" + item.image,
				label: $(".class-info  li.col-lg-4").toArray().map((e) => $(e).text()),
				support
			}) + html.replaceAll(/\ssrc=".+?"/g, "").replaceAll("data-src", "src");
			return item;
		})));
		return {
			title: `${typeName} - MC百科`,
			description: $("meta[name=\"description\"]").attr("content"),
			link: "https://www.mcmod.cn",
			item: items
		};
	}
};
//#endregion
export { route };
