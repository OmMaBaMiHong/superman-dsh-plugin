import { t as got_default } from "./got-Dnzt41dd.mjs";
import { r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
import dayjs from "dayjs";
//#region lib/routes/plurk/search.ts
const route = {
	path: "/search/:keyword",
	categories: ["social-media"],
	example: "/plurk/search/FGO",
	parameters: { keyword: "Search keyword" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Search",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const keyword = ctx.req.param("keyword");
	const { data: apiResponse } = await got_default.post(`${baseUrl}/Search/search2`, { searchParams: {
		query: keyword,
		start_date: dayjs().subtract(1, "year").format("YYYY/MM"),
		end_date: dayjs().format("YYYY/MM")
	} });
	const users = apiResponse.users;
	const plurks = apiResponse.plurks;
	const items = await Promise.all(plurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, users[item.user_id].display_name)));
	return {
		title: `Search "${keyword}" - Plurk`,
		description: "Search messages on Plurk",
		image: "https://s.plurk.com/e8266f512246cdbc2721.jpg",
		link: `${baseUrl}/search?q=${encodeURIComponent(keyword)}`,
		item: items
	};
}
//#endregion
export { route };
