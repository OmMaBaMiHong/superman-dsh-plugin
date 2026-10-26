import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/houxu/index.tsx
const route = {
	name: "热点",
	maintainers: ["nczitzk"],
	example: "/houxu",
	path: "/",
	radar: [{ source: ["houxu.app/"] }],
	handler,
	url: "houxu.app/"
};
async function handler(ctx) {
	const rootUrl = "https://houxu.app";
	return {
		title: "后续 - 热点",
		link: rootUrl,
		item: (await got_default({
			method: "get",
			url: `${rootUrl}/api/1/records/index?limit=${ctx.req.query("limit") ?? 50}`
		})).data.results.map((item) => ({
			guid: `${rootUrl}/lives/${item.object.id}#${item.object.last.id}`,
			title: item.object.title,
			link: `${rootUrl}/lives/${item.object.id}`,
			author: item.object.last.link.source ?? item.object.last.link.media.name,
			pubDate: parseDate(item.object.news_update_at),
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: item.object.title }),
				/* @__PURE__ */ jsx("p", { children: item.object.summary }),
				/* @__PURE__ */ jsxs("b", { children: [
					"Latest: ",
					/* @__PURE__ */ jsx("a", {
						href: item.object.last.link.url,
						children: item.object.last.link.title
					}),
					item.object.last.link.source || item.object.last.link.media.name ? /* @__PURE__ */ jsxs(Fragment, { children: [
						" (",
						item.object.last.link.source ?? item.object.last.link.media.name,
						")"
					] }) : null
				] }),
				/* @__PURE__ */ jsx("p", { children: raw(item.object.last.link.description.replaceAll("\r\n", "<br>")) }),
				/* @__PURE__ */ jsx("small", { children: item.object.news_update_at })
			] }))
		}))
	};
}
//#endregion
export { route };
