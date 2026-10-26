import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { i as parseItems, r as headers } from "./utils-CM2dWw66.mjs";
import { load } from "cheerio";
//#region lib/routes/pornhub/category-url.ts
const route = {
	path: "/category_url/:url?/:language?/:img?",
	categories: ["multimedia"],
	example: "/pornhub/category_url/video%3Fc%3D15%26o%3Dmv%26t%3Dw%26cc%3Djp",
	parameters: {
		language: "language, see below. defaults to `www` (English)",
		url: "relative path after `pornhub.com/`, need to be URL encoded",
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
	name: "Video List",
	maintainers: ["I2IMk", "queensferryme"],
	handler,
	description: `**\`language\`**

Refer to [Pornhub F.A.Qs](https://help.pornhub.com/hc/en-us/articles/360044327034-How-do-I-change-the-language-), English by default. For example:

- \`cn\` (Chinese), for Pornhub in China <https://cn.pornhub.com>；

- \`jp\` (Japanese), for Pornhub in Japan <https://jp.pornhub.com> etc.`
};
async function handler(ctx) {
	const { language = "www", url = "video", img } = ctx.req.param();
	const link = `https://${language}.pornhub.com/${url}`;
	if (!isValidHost(language)) throw new InvalidParameterError("Invalid language");
	const { data: response } = await got_default(link, { headers });
	const $ = load(response);
	const showImages = img === "img=1";
	const items = $("#videoCategory .videoBox").toArray().map((e) => parseItems($(e), showImages));
	return {
		title: $("title").first().text(),
		link,
		language: $("html").attr("lang"),
		item: items
	};
}
//#endregion
export { route };
