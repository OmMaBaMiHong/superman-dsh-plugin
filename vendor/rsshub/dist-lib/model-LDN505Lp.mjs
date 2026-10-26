import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { i as parseItems, n as getRadarDomin, r as headers } from "./utils-CM2dWw66.mjs";
import { load } from "cheerio";
//#region lib/routes/pornhub/model.ts
const route = {
	path: "/model/:username/:language?/:sort?/:img?",
	categories: ["multimedia"],
	view: 3,
	example: "/pornhub/model/stacy-starando",
	parameters: {
		language: "language, see below. defaults to www",
		username: "username, part of the url e.g. `pornhub.com/model/stacy-starando`",
		sort: "sorting method, see below. Defaults to mr (most recent)",
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
	radar: getRadarDomin("/model/:username"),
	name: "Model",
	maintainers: ["I2IMk", "queensferryme"],
	handler
};
async function handler(ctx) {
	const { language = "www", username, sort = "", img } = ctx.req.param();
	const link = `https://${language}.pornhub.com/model/${username}/videos${sort ? `?o=${sort}` : ""}`;
	if (!isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const { data: response } = await got_default(link, { headers });
	const $ = load(response);
	const showImages = img === "img=1";
	const items = $("#mostRecentVideosSection .videoBox").toArray().map((e) => parseItems($(e), showImages));
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
