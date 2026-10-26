import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchFriends, r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
import { load } from "cheerio";
//#region lib/routes/plurk/user.ts
const route = {
	path: "/user/:user",
	categories: ["social-media"],
	view: 1,
	example: "/plurk/user/plurkoffice",
	parameters: { user: "User ID, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "User",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const user = ctx.req.param("user");
	const { data: pageResponse } = await got_default(`${baseUrl}/${user}`);
	const $ = load(pageResponse);
	const publicPlurks = JSON.parse($("body script[type]").text().match(/PUBLIC_PLURKS = (.*);\nPINNED_PLURK/)[1].replaceAll(/new Date\((.*?)\)/g, "$1").replaceAll("null", "\"\""));
	const names = await fetchFriends(publicPlurks.map((item) => item.user_id));
	const items = await Promise.all(publicPlurks.map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name)));
	return {
		title: $("head title").text(),
		description: $("meta[property=og:description]").attr("content"),
		image: $("meta[property=og:image]").attr("content") || $("meta[name=msapplication-TileImage]").attr("content"),
		link: `${baseUrl}/${user}`,
		item: items
	};
}
//#endregion
export { route };
