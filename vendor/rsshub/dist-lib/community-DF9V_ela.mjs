import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as md5 } from "./md5-CpIHIxCO.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/jiuyangongshe/community.tsx
const render = (data) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [data.cover ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: data.cover }), /* @__PURE__ */ jsx("br", {})] }) : null, data.content] }));
const route = {
	path: "/community",
	categories: ["finance"],
	view: 0,
	example: "/jiuyangongshe/community",
	maintainers: ["TonyRL"],
	name: "社群",
	handler,
	radar: [{ source: ["www.jiuyangongshe.com"] }]
};
async function handler(ctx) {
	const link = "https://www.jiuyangongshe.com";
	const time = String(Date.now());
	return {
		title: "社群 - 韭研公社-研究共享，茁壮成长（原韭菜公社）",
		link,
		language: "zh-CN",
		item: (await rofetch("https://app.jiuyangongshe.com/jystock-app/api/v2/article/community", {
			method: "POST",
			headers: {
				platform: "3",
				timestamp: time,
				token: md5(`Uu0KfOB8iUP69d3c:${time}`)
			},
			body: {
				category_id: "",
				limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30,
				order: 0,
				start: 1,
				type: 0,
				back_garden: 0
			}
		})).data.result.map((item) => ({
			title: item.title,
			description: render({
				cover: item.cover,
				content: item.content
			}),
			link: `${link}/a/${item.article_id}`,
			pubDate: timezone(parseDate(item.create_time, "YYYY-MM-DD HH:mm:ss"), 8),
			author: item.user.nickname,
			category: item.stock_list.map((stock) => stock.name)
		}))
	};
}
//#endregion
export { route };
