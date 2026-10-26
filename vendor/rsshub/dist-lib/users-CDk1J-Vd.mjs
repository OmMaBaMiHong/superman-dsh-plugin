import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { i as parseItems, n as getRadarDomin, r as headers } from "./utils-CM2dWw66.mjs";
import { load } from "cheerio";
//#region lib/routes/pornhub/users.ts
const route = {
	path: "/users/:username/:language?/:img?",
	categories: ["multimedia"],
	example: "/pornhub/users/pornhubmodels",
	parameters: {
		language: "language, see below. defaults to `www` (English)",
		username: "username, part of the url e.g. `pornhub.com/users/pornhubmodels`",
		img: "show images, set to `img=1` to enable"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	radar: getRadarDomin("/users/:username"),
	name: "Users",
	maintainers: ["I2IMk", "queensferryme"],
	handler
};
async function handler(ctx) {
	const { language = "www", username, img } = ctx.req.param();
	const link = `https://${language}.pornhub.com/users/${username}/videos`;
	if (!isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const { data: response } = await got_default(link, { headers });
	const $ = load(response);
	const showImages = img === "img=1";
	const items = $(".videoUList .videoBox").toArray().map((e) => parseItems($(e), showImages));
	return {
		title: $(".profileUserName a").text(),
		description: $(".aboutMeText").text().trim(),
		link,
		image: $("#getAvatar").attr("src"),
		language: $("html").attr("lang"),
		allowEmpty: true,
		item: items
	};
}
//#endregion
export { route };
