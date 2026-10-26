import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as notesUrl, n as extractNotes } from "./utils-DDi1zjra.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/notes/user.ts
const route = {
	path: "/notes/:lang?/user/:uid",
	categories: ["anime"],
	example: "/qoo-app/notes/en/user/35399143",
	parameters: {
		lang: "Language, see the table above, empty means `中文`",
		uid: "User ID, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User Notes",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { uid, lang } = ctx.req.param();
	const link = `${notesUrl}${lang ? `/${lang}` : ""}/user/${uid}`;
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
