import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchFriends, r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
//#region lib/routes/plurk/news.ts
const route = {
	path: "/news/:lang?",
	categories: ["social-media"],
	example: "/plurk/news/:lang?",
	parameters: { lang: "Language, see the table above, `en` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["plurk.com/news"],
		target: "/news"
	}],
	name: "Plurk News",
	maintainers: ["TonyRL"],
	handler,
	url: "plurk.com/news"
};
async function handler(ctx) {
	const { lang = "en" } = ctx.req.param();
	const { data: apiResponse } = await got_default(`${baseUrl}/PlurkTop/fetchOfficialPlurks`, { searchParams: { lang } });
	const names = await fetchFriends(apiResponse.map((item) => item.user_id));
	const items = await Promise.all(apiResponse.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name)));
	return {
		title: "Plurk News - Plurk",
		image: "https://s.plurk.com/2c1574c02566f3b06e91.png",
		link: `${baseUrl}/news`,
		item: items
	};
}
//#endregion
export { route };
