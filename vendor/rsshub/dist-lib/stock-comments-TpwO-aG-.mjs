import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/xueqiu/stock-comments.tsx
const route = {
	path: "/stock_comments/:id",
	categories: ["finance"],
	example: "/xueqiu/stock_comments/SZ002626",
	parameters: { id: "股票代码（需要带上交易所）" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xueqiu.com/S/:id"] }],
	name: "股票评论",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const res = await got_default({
		method: "get",
		url: `https://xueqiu.com/query/v1/symbol/search/status?u=11111&count=100&comment=0&symbol=${id}&source=all&sort=time`
	});
	const stock_name = await cache_default.tryGet(`stock_name_${id}`, async () => {
		return load((await got_default({
			method: "get",
			url: `https://xueqiu.com/S/${id}`
		})).data)(".stock-name").text().split("(", 1)[0];
	});
	const data = res.data.list;
	return {
		title: `${id} ${stock_name} - 评论`,
		link: `https://xueqiu.com/S/${id}`,
		description: `${stock_name} - 评论`,
		item: data.map((item) => {
			let link = `https://xueqiu.com${item.target}`;
			if (item.quote_cards) link = item.quote_cards[0].target_url;
			const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("a", {
					href: `https://xueqiu.com/u/${item.user.id}`,
					children: /* @__PURE__ */ jsxs("div", {
						style: "font-weight: bold;",
						children: [item.user.screen_name, ":"]
					})
				}),
				/* @__PURE__ */ jsx("hr", {}),
				item.text ? raw(item.text) : null,
				/* @__PURE__ */ jsx("br", {}),
				item.retweeted_status ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("hr", { style: "border:1 dashed #987cb9" }), raw(item.retweeted_status.text)] }) : /* @__PURE__ */ jsx("hr", {}),
				/* @__PURE__ */ jsxs("div", {
					style: "text-align:right",
					children: ["----来源于:", item.source]
				})
			] }));
			return {
				title: item.title || sanitizeHtml(item.text, {
					allowedTags: [],
					allowedAttributes: {}
				}),
				description,
				pubDate: parseDate(item.created_at),
				link
			};
		})
	};
}
//#endregion
export { route };
