import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as notesUrl, n as extractNotes } from "./utils-DDi1zjra.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/notes/topic.ts
const route = {
	path: "/notes/:lang?/topic/:topic",
	name: "Unknown",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { topic, lang } = ctx.req.param();
	const link = `${notesUrl}${lang ? `/${lang}` : ""}/topic/${topic}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const items = extractNotes($);
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
