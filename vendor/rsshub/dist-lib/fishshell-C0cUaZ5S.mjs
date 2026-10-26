import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/fishshell/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["fishshell.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["x2cf"],
	handler,
	url: "fishshell.com/"
};
async function handler() {
	const link = "https://fishshell.com/docs/current/relnotes.html";
	const $ = load(await cache_default.tryGet(link, async () => (await got_default(link)).data, config.cache.contentExpire, false));
	return {
		link,
		title: "Release notes — fish-shell",
		language: "en",
		item: $("#release-notes > section").toArray().map((item) => {
			const title = $(item).find("h2").contents().first().text();
			const date = title.match(/\(released (.+?)\)/)?.[1];
			return {
				title,
				link: new URL($(item).find("a").attr("href"), link).href,
				pubDate: date ? parseDate(date, "MMMM D, YYYY") : void 0,
				description: $(item).html()
			};
		})
	};
}
//#endregion
export { route };
