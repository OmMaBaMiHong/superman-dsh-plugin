import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/houxu/memory.tsx
const route = {
	path: "/memory",
	categories: ["new-media"],
	example: "/houxu/memory",
	radar: [{ source: ["houxu.app/memory", "houxu.app/"] }],
	name: "跟踪",
	maintainers: ["nczitzk"],
	handler,
	url: "houxu.app/memory"
};
async function handler(ctx) {
	const rootUrl = "https://houxu.app";
	const apiUrl = `${rootUrl}/api/1/lives/updated?limit=${ctx.req.query("limit") ?? 50}`;
	return {
		title: "后续 - 跟踪",
		link: `${rootUrl}/memory`,
		item: (await got_default({
			method: "get",
			url: apiUrl
		})).data.results.map((item) => ({
			guid: `${rootUrl}/lives/${item.id}#${item.last.id}`,
			title: item.last.link.title,
			link: `${rootUrl}/lives/${item.id}`,
			author: item.last.link.source,
			category: [item.title],
			pubDate: parseDate(item.last.create_at),
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: item.title }),
				/* @__PURE__ */ jsxs("b", { children: [/* @__PURE__ */ jsx("a", {
					href: item.last.link.url,
					children: item.last.link.title
				}), item.last.link.source ? /* @__PURE__ */ jsxs(Fragment, { children: [
					" (",
					item.last.link.source,
					")"
				] }) : null] }),
				/* @__PURE__ */ jsx("p", { children: item.last.link.description })
			] }))
		}))
	};
}
//#endregion
export { route };
