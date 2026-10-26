import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
//#region lib/routes/plurk/top.ts
const categoryList = /* @__PURE__ */ new Set([
	"topReplurks",
	"topFavorites",
	"topResponded"
]);
const route = {
	path: "/top/:category?/:lang?",
	categories: ["social-media"],
	view: 1,
	example: "/plurk/top/topReplurks",
	parameters: {
		category: "Category, see the table below, `topReplurks` by default",
		lang: "Language, see the table below, `en` by default"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Top",
	maintainers: ["TonyRL"],
	handler,
	description: `| Top Replurks | Top Favorites | Top Responded |
| ------------ | ------------- | ------------- |
| topReplurks  | topFavorites  | topResponded  |

| English | 中文（繁體） |
| ------- | ------------ |
| en      | zh           |`
};
async function handler(ctx) {
	const { category = "topReplurks", lang = "en" } = ctx.req.param();
	if (!categoryList.has(category)) throw new InvalidParameterError(`Invalid category: ${category}`);
	const { data: apiResponse } = await got_default(`${baseUrl}/Stats/${category}`, { searchParams: {
		period: "day",
		lang,
		limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 90
	} });
	const items = await Promise.all(apiResponse.stats.map((item) => item[1]).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, item.owner.display_name)));
	return {
		title: "Top Plurk - Plurk",
		image: "https://s.plurk.com/2c1574c02566f3b06e91.png",
		link: `${baseUrl}/top#${category}`,
		item: items,
		language: lang
	};
}
//#endregion
export { route };
