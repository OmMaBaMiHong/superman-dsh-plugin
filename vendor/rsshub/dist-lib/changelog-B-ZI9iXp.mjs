import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import R from "node:zlib";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/typeless/changelog.ts
const md = markdownit({
	breaks: true,
	html: true
});
const route = {
	path: "/changelog",
	example: "/typeless/changelog",
	categories: ["program-update"],
	radar: [{ source: [
		"www.typeless.com/help/release-notes/*",
		"www.typeless.com/help/release-notes",
		"www.typeless.com"
	] }],
	name: "Changelog",
	maintainers: ["TonyRL"],
	handler,
	url: "www.typeless.com/help/release-notes"
};
async function handler() {
	const baseUrl = "https://www.typeless.com";
	const items = (await Promise.all([
		"macos",
		"windows",
		"ios",
		"android"
	].map(async (platform) => {
		const $ = load(await rofetch(`${baseUrl}/help/release-notes/${platform}`));
		const pageProps = JSON.parse($("#__NEXT_DATA__").text()).props.pageProps;
		return cache_default.tryGet(`typeless:changelog:${platform}:${pageProps.updatedAt}`, () => {
			const compressedData = pageProps.compressedData;
			const decodedString = Buffer.from(compressedData, "base64");
			const decompressed = R.gunzipSync(decodedString).toString("utf-8");
			const changelogData = JSON.parse(decompressed);
			return {
				appPlatform: pageProps.platform,
				decompressedData: Object.values(changelogData).map((item) => item.en)
			};
		});
	}))).flatMap((platform) => platform.decompressedData.map((item) => {
		const features = item.features[0];
		return {
			title: features.title,
			description: md.render(features.content),
			pubDate: parseDate(item.date),
			link: features.learnMore ? `${baseUrl}${features.learnMore}` : void 0,
			category: [platform.appPlatform],
			guid: `typeless:${platform.appPlatform}:${item.version}`
		};
	}));
	return {
		title: "Typeless app release notes",
		link: `${baseUrl}/help/release-notes`,
		image: `${baseUrl}/logo_500.png`,
		item: items
	};
}
//#endregion
export { route };
