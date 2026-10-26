import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/sspai/shortcuts-gallery.ts
const route = {
	path: "/shortcuts",
	categories: ["new-media"],
	example: "/sspai/shortcuts",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["shortcuts.sspai.com/*"] }],
	name: "Shortcuts Gallery",
	maintainers: ["Andiedie"],
	handler,
	url: "shortcuts.sspai.com/*"
};
async function handler() {
	const { data: { data: categories } } = await got_default("https://shortcuts.sspai.com/api/v1/user/workflow/all/get");
	return {
		title: "Shortcuts Gallery - 少数派",
		link: "https://shortcuts.sspai.com/#/main/workflow",
		description: "Shortcuts Gallery - 少数派",
		item: categories.flatMap((category) => (category.data || []).map((shortcut) => ({
			title: shortcut.name,
			description: `作者：<a href="${shortcut.author_url || "#"}">${shortcut.author_id}</a><br/>${decodeURIComponent((shortcut.description || "").replaceAll("+", "%20"))}`,
			pubDate: parseDate(shortcut.utime * 1e3),
			guid: shortcut.id,
			link: shortcut.url
		})))
	};
}
//#endregion
export { route };
