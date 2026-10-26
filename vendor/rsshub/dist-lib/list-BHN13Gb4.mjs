import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import xxhash from "xxhash-wasm";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/tophub/list.tsx
const route = {
	path: "/list/:id",
	categories: ["new-media"],
	example: "/tophub/list/Om4ejxvxEN",
	parameters: { id: "榜单id，可在 URL 中找到" },
	features: {
		requireConfig: [{
			name: "TOPHUB_COOKIE",
			optional: true,
			description: ""
		}],
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tophub.today/n/:id"] }],
	name: "榜单列表",
	maintainers: ["akynazh"],
	handler,
	description: `::: tip
将榜单条目集合到一个列表中，且有热度排序，可避免推送大量条目。
:::`
};
async function handler(ctx) {
	const { h64ToString } = await xxhash();
	const link = `https://tophub.today/n/${ctx.req.param("id")}`;
	const $ = load(await rofetch(link, { headers: {
		Referer: "https://tophub.today",
		Cookie: config.tophub?.cookie ?? ""
	} }));
	const title = $(".tt h3").text().trim();
	const items = $(".rank-all-item:not(.history-content) .jc-c tr").toArray().map((e) => ({
		title: $(e).find("td a").text().trim(),
		link: $(e).find("td a").attr("href"),
		heatRate: $(e).find("td:nth-child(3)").text().trim()
	}));
	const combinedTitles = items.map((item) => item.title).join("");
	const renderRank = renderToString(/* @__PURE__ */ jsxs("table", { children: [/* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "排名" }),
		/* @__PURE__ */ jsx("th", { children: "标题" }),
		/* @__PURE__ */ jsx("th", { children: "热度" })
	] }) }), /* @__PURE__ */ jsx("tbody", { children: items.map((item, index) => /* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("td", { children: index + 1 }),
		/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("a", {
			href: item.link,
			children: item.title
		}) }),
		/* @__PURE__ */ jsx("td", { children: item.heatRate })
	] })) })] }));
	return {
		title,
		description: $(".tt p").text().trim(),
		image: $(".ii img").attr("src"),
		link,
		item: [{
			title,
			link,
			description: renderRank,
			guid: h64ToString(combinedTitles)
		}]
	};
}
//#endregion
export { route };
