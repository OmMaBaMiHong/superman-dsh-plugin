import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/houxu/events.tsx
const route = {
	path: "/events",
	categories: ["new-media"],
	example: "/houxu/events",
	radar: [{ source: ["houxu.app/events", "houxu.app/"] }],
	name: "专栏",
	maintainers: ["nczitzk"],
	handler,
	url: "houxu.app/events"
};
async function handler(ctx) {
	const rootUrl = "https://houxu.app";
	const apiUrl = `${rootUrl}/api/1/events?limit=${ctx.req.query("limit") ?? 50}`;
	return {
		title: "后续 - 专栏",
		link: `${rootUrl}/events`,
		item: (await got_default({
			method: "get",
			url: apiUrl
		})).data.results.map((item) => ({
			guid: `${rootUrl}/events/${item.id}#${item.last_thread.id}`,
			title: item.title,
			link: `${rootUrl}/events/${item.id}`,
			author: item.creator.name,
			category: item.tags,
			pubDate: parseDate(item.update_at),
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h1", { children: item.title }),
				/* @__PURE__ */ jsx("p", { children: item.description }),
				/* @__PURE__ */ jsxs("b", { children: ["Latest: ", item.last_thread.link_title] }),
				/* @__PURE__ */ jsx("p", { children: raw(item.last_thread.title.replaceAll("\r\n", "<br>")) }),
				/* @__PURE__ */ jsx("small", { children: item.update_at })
			] }))
		}))
	};
}
//#endregion
export { route };
