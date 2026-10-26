import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/nintendo/templates/eshop-jp.tsx
const renderEshopJpDescription = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	/* @__PURE__ */ jsx("img", { src: `https://img-eshop.cdn.nintendo.net/i/${item.iurl}.jpg` }),
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("strong", { children: "发售日期：" }),
	item.pdate,
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("strong", { children: "价格：" }),
	item.dprice,
	"円",
	/* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("br", {}),
	item.hcopy ? item.hcopy.map((text) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("b", { children: text }), /* @__PURE__ */ jsx("br", {})] })) : null,
	/* @__PURE__ */ jsx("br", {}),
	item.text ? /* @__PURE__ */ jsx(Fragment, { children: raw(item.text.replaceAll("\n", "<br>")) }) : null
] }));
//#endregion
//#region lib/routes/nintendo/eshop-jp.ts
const route = {
	path: "/eshop/jp",
	radar: [{ source: ["nintendo.co.jp/software/switch/index.html", "nintendo.co.jp/"] }],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "nintendo.co.jp/software/switch/index.html"
};
async function handler(ctx) {
	return {
		title: "Nintendo eShop（日服）新游戏",
		link: "https://www.nintendo.co.jp/software/switch/index.html",
		description: "Nintendo eShop（日服）新上架的游戏",
		item: (await got_default("https://search.nintendo.jp/nintendo_soft/search.json", { searchParams: {
			opt_sshow: 1,
			fq: "ssitu_s:onsale OR ssitu_s:preorder OR memo_bg:forced",
			limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 24,
			page: 1,
			c: "50310840317994813",
			opt_osale: 1,
			opt_hard: "1_HAC",
			sort: "sodate desc,score"
		} })).data.result.items.map((item) => ({
			title: item.title,
			description: renderEshopJpDescription(item),
			link: `https://ec.nintendo.com/JP/ja/titles/${item.id}`,
			pubDate: parseDate(item.pdate)
		}))
	};
}
//#endregion
export { route };
