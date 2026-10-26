import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/mysql/release.ts
const route = {
	path: "/release/:version?",
	categories: ["programming"],
	example: "/mysql/release/8.0",
	parameters: { version: "Version, see below, 8.0 by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Release Notes",
	maintainers: ["nczitzk"],
	handler,
	description: `| 8.0 | 5.7 | 5.6 |
| --- | --- | --- |`
};
async function handler(ctx) {
	const currentUrl = `https://dev.mysql.com/doc/relnotes/mysql/${ctx.req.param("version") ?? "8.0"}/en/`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl,
		headers: { "user-agent": config.trueUA }
	})).data);
	let items = $("dt span a").slice(1, -1).toArray().map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: `${currentUrl}${item.attr("href")}`
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link,
			headers: { "user-agent": config.trueUA }
		})).data);
		content(".indexterm").remove();
		content(".titlepage").first().remove();
		content(".itemizedlist").first().remove();
		item.description = content("#docs-body .section").html();
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
