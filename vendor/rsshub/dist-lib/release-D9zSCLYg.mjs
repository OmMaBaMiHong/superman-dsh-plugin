import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/firefox/release.ts
const platformSlugs = {
	desktop: "releasenotes",
	beta: "beta/notes",
	nightly: "nightly/notes",
	android: "android/releasenotes",
	ios: "ios/notes"
};
const route = {
	path: "/release/:platform?",
	name: "Unknown",
	maintainers: [],
	handler
};
async function handler(ctx) {
	const { platform = "desktop" } = ctx.req.param();
	const devicePlatform = platform.replace("-", "/");
	const link = ["https://www.mozilla.org/en-US/firefox", Object.hasOwn(platformSlugs, devicePlatform) ? platformSlugs[devicePlatform] : devicePlatform].filter(Boolean).join("/");
	const $ = load((await got_default.get(link)).data);
	const version = $(".c-release-version").text();
	const pubDate = parseDate($(".c-release-date").text(), "MMMM D, YYYY");
	return {
		title: `Firefox ${platform} release notes`,
		link,
		item: [{
			title: `Firefox ${platform} ${version} release notes`,
			link,
			description: $(".c-release-notes").html(),
			guid: `${platform} ${version}`,
			pubDate
		}]
	};
}
//#endregion
export { route };
