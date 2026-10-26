import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { a as renderDescription, t as defaultDomain } from "./utils-CM2dWw66.mjs";
//#region lib/routes/pornhub/search.ts
const route = {
	path: "/search/:keyword/:img?",
	categories: ["multimedia"],
	view: 3,
	example: "/pornhub/search/stepsister",
	parameters: {
		keyword: "keyword",
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
	name: "Keyword Search",
	maintainers: ["nczitzk"],
	handler
};
async function handler(ctx) {
	const { keyword, img } = ctx.req.param();
	const currentUrl = `${defaultDomain}/webmasters/search?search=${keyword}`;
	const response = await got_default(currentUrl);
	const showImages = img === "img=1";
	const list = response.data.videos.map((item) => ({
		title: item.title,
		link: item.url,
		description: renderDescription({ thumbs: item.thumbs }, showImages),
		pubDate: parseDate(item.publish_date),
		category: [.../* @__PURE__ */ new Set([...item.tags.map((t) => t.tag_name), ...item.categories.map((c) => c.category)])]
	}));
	return {
		title: `Pornhub - ${keyword}`,
		link: currentUrl,
		item: list
	};
}
//#endregion
export { route };
