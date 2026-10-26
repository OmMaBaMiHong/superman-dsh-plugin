import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { load } from "cheerio";
//#region lib/routes/claude/code-changelog.ts
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "25");
	const targetUrl = `https://code.claude.com/docs/en/changelog`;
	const $ = load(await rofetch(targetUrl));
	return {
		title: "Claude Code Changelog",
		description: "Changelog for Claude Code CLI",
		link: targetUrl,
		item: $("div.update-container").slice(0, limit).toArray().map((el) => {
			const $entry = $(el);
			const version = $entry.find("[data-component-part=\"update-label\"]").text().trim();
			if (!version) return null;
			const dateText = $entry.find("[data-component-part=\"update-description\"]").text().trim();
			const description = $entry.find("[data-component-part=\"update-content\"]").html() ?? "";
			const anchor = $entry.attr("id") ?? version.replaceAll(".", "-");
			return {
				title: version,
				description,
				link: `${targetUrl}#${anchor}`,
				pubDate: dateText ? parseDate(dateText) : void 0,
				guid: `claude-code-${version}`,
				id: `claude-code-${version}`
			};
		}).filter(Boolean),
		allowEmpty: true
	};
};
const route = {
	path: "/code/changelog",
	name: "Code Changelog",
	url: "code.claude.com",
	maintainers: ["rmaced0"],
	handler,
	example: "/claude/code/changelog",
	categories: ["program-update"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["code.claude.com/docs/en/changelog"],
		target: "/code/changelog"
	}]
};
//#endregion
export { route };
