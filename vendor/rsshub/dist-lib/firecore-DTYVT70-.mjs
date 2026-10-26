import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/firecore/index.ts
const route = {
	path: "/:os",
	categories: ["program-update"],
	example: "/firecore/ios",
	parameters: { os: "`ios`,`tvos`,`macos`" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Release Notes",
	maintainers: ["NathanDai"],
	handler
};
async function handler(ctx) {
	const { data } = await got_default("https://firecore.com/releases");
	const $ = load(data);
	const items = $(`div.tab-pane.fade#${ctx.req.param("os")}`).find(".release-date").toArray().map((item) => {
		item = $(item);
		const title = item.parent().contents().filter((_, el) => el.nodeType === 3).text();
		const pubDate = parseDate(item.text().match(/(\d{4}-\d{2}-\d{2})/)[1]);
		return {
			title,
			description: item.parent().nextUntil("hr").toArray().map((item) => $(item).html()).join(""),
			pubDate
		};
	});
	return {
		title: `Infuse Release Notes (${ctx.req.param("os")})`,
		link: "https://firecore.com/releases",
		item: items
	};
}
//#endregion
export { route };
