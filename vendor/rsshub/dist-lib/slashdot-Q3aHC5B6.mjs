import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/slashdot/index.ts
const route = {
	path: "/:section?",
	categories: ["new-media"],
	example: "/slashdot",
	parameters: { section: "Section name, can be found in the URL host, leave empty for the main page" },
	radar: [
		{ source: ["slashdot.org"] },
		{
			source: ["devices.slashdot.org"],
			target: "/devices"
		},
		{
			source: ["build.slashdot.org"],
			target: "/build"
		},
		{
			source: ["entertainment.slashdot.org"],
			target: "/entertainment"
		},
		{
			source: ["technology.slashdot.org"],
			target: "/technology"
		},
		{
			source: ["science.slashdot.org"],
			target: "/science"
		},
		{
			source: ["yro.slashdot.org"],
			target: "/yro"
		}
	],
	name: "News",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const { section } = ctx.req.param();
	if (section && !isValidHost(section)) throw new InvalidParameterError("Invalid section name");
	const link = section ? `https://${section}.slashdot.org` : "https://slashdot.org";
	const $ = load(await rofetch(link));
	const list = $(".article").toArray().map((item) => {
		const $item = $(item);
		const a = $item.find(".story-title a").first();
		const details = $item.find(".details");
		return {
			title: a.text(),
			link: a.attr("href"),
			description: $item.find(".body").html(),
			pubDate: parseDate(details.find("time").attr("datetime")?.replace(/on\s\w+?day\s/, "")?.replace("@", "")?.replace(/(\d{2}:\d{2})(\w{2})$/, "$1 $2"))
		};
	});
	return {
		title: $("head title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link,
		item: list
	};
}
//#endregion
export { route };
