import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as appsUrl } from "./utils-DDi1zjra.mjs";
import { load } from "cheerio";
//#region lib/routes/qoo-app/apps/note.ts
const route = {
	path: "/apps/:lang?/note/:id",
	categories: ["anime"],
	example: "/qoo-app/apps/en/note/7675",
	parameters: {
		lang: "Language, see the table above, empty means `中文`",
		id: "Game ID, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Game Store - Notes",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { id, lang = "" } = ctx.req.param();
	const link = `${appsUrl}${lang ? `/${lang}` : ""}/app-note/${id}`;
	const { data: response } = await got_default(link);
	const $ = load(response);
	const list = $(".qoo-note-wrap").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find(".content-title").text() || item.find(".description").text(),
			link: item.find("a.link-wrap").attr("href"),
			description: item.find(".description").text(),
			pubDate: timezone(parseDate(item.find("time").text(), "YYYY-MM-DD HH:mm"), 8),
			author: item.find("cite.name").text()
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const { data: response } = await got_default(item.link);
		const $ = load(response);
		$("footer").remove();
		item.description = $("article .content").html();
		return item;
	})));
	return {
		title: $("head title").text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
