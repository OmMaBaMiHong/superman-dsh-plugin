import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as notesUrl, s as ssoUrl } from "./utils-DDi1zjra.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/qoo-app/templates/note.tsx
const renderNote = ({ content, picture }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [content, picture ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), /* @__PURE__ */ jsx("img", { src: picture })] }) : null] }));
//#endregion
//#region lib/routes/qoo-app/notes/note.ts
const route = {
	path: "/notes/:lang?/note/:id",
	categories: ["anime"],
	example: "/qoo-app/notes/en/note/2329113",
	parameters: {
		lang: "Language, see the table above, empty means `中文`",
		id: "Note ID, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Note Comments",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const api = `${ssoUrl}/api/v1/comments`;
	const link = `${notesUrl}/note/${id}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const { data } = await got_default(api, { searchParams: {
		sort: "newest",
		for: "web",
		limit: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 100,
		type: "note",
		object_id: id
	} });
	const items = data.data.map((item) => ({
		title: item.content,
		description: renderNote({
			content: item.content,
			picture: item.picture
		}),
		pubDate: parseDate(item.created_timestamp),
		author: item.user.name,
		guid: `qoo-app:notes:note:${id}:${item.id}`
	}));
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
