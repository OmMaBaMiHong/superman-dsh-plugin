import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as playwrightGet, t as baseUrl } from "./utils-CwBD7raC.mjs";
import { load } from "cheerio";
//#region lib/routes/pincong/topic.ts
const route = {
	path: "/topic/:topic",
	radar: [{ source: ["pincong.rocks/topic/:topic"] }],
	name: "Unknown",
	maintainers: ["zphw"],
	handler
};
async function handler(ctx) {
	const url = `${baseUrl}/topic/${ctx.req.param("topic")}`;
	const $ = load(await playwrightGet(url, cache_default));
	const list = $("div.aw-item");
	return {
		title: `品葱 - ${ctx.req.param("topic")}`,
		link: url,
		item: list.toArray().map((item) => ({
			title: $(item).find("h4 a").text().trim(),
			link: baseUrl + $(item).find("h4 a").attr("href"),
			pubDate: parseDate($(item).attr("data-created-at") * 1e3)
		}))
	};
}
//#endregion
export { route };
