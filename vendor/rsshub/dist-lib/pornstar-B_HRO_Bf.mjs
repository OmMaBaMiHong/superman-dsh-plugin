import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { i as parseItems, n as getRadarDomin, r as headers } from "./utils-CM2dWw66.mjs";
import { load } from "cheerio";
//#region lib/routes/pornhub/pornstar.ts
const route = {
	path: "/pornstar/:username/:language?/:sort?/:img?",
	categories: ["multimedia"],
	view: 3,
	example: "/pornhub/pornstar/june-liu/www/mr",
	parameters: {
		username: { description: "username, part of the url e.g. `pornhub.com/pornstar/june-liu`" },
		language: {
			description: "language, defaults to `www` (English)",
			options: [
				{
					value: "www",
					label: "English"
				},
				{
					value: "de",
					label: "Deutsch"
				},
				{
					value: "es",
					label: "Español"
				},
				{
					value: "fr",
					label: "Français"
				},
				{
					value: "it",
					label: "Italiano"
				},
				{
					value: "ja",
					label: "日本語"
				},
				{
					value: "pt",
					label: "Português"
				},
				{
					value: "pl",
					label: "Polski"
				},
				{
					value: "rt",
					label: "Русский"
				},
				{
					value: "nl",
					label: "Dutch"
				},
				{
					value: "cs",
					label: "Czech"
				},
				{
					value: "cn",
					label: "中文（简体）"
				}
			],
			default: "www"
		},
		sort: {
			description: "sorting method, defaults to `mr` (Most Recent)",
			options: [
				{
					label: "Most Recent",
					value: "mr"
				},
				{
					label: "Most Viewed",
					value: "mv"
				},
				{
					label: "Top Rated",
					value: "tr"
				},
				{
					label: "Longest",
					value: "lg"
				}
			]
		},
		img: "show images, set to `img=1` to enable"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: getRadarDomin("/pornstar/:username"),
	name: "Pornstar",
	maintainers: ["I2IMk", "queensferryme"],
	handler
};
async function handler(ctx) {
	const { language = "www", username, sort = "mr", img } = ctx.req.param();
	let link = `https://${language}.pornhub.com/pornstar/${username}?o=${sort}`;
	if (!isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const { data: response } = await got_default(link, { headers });
	let $ = load(response);
	let items;
	const showImages = img === "img=1";
	if ($(".withBio").length === 0) {
		link = `https://${language}.pornhub.com/pornstar/${username}/videos?o=${sort}`;
		const { data: response } = await got_default(link, { headers });
		$ = load(response);
		items = $("#mostRecentVideosSection .videoBox").toArray().map((e) => parseItems($(e), showImages));
	} else items = $("#pornstarsVideoSection .videoBox").toArray().map((e) => parseItems($(e), showImages));
	return {
		title: $("h1").first().text(),
		description: $("section.aboutMeSection").text().trim(),
		link,
		image: $("#getAvatar").attr("src"),
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
