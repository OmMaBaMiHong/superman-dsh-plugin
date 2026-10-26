import "./types-DNj6Etbg.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { n as fetchFriends, r as getPlurk, t as baseUrl } from "./utils-BmJCEArY.mjs";
import { load } from "cheerio";
//#region lib/routes/plurk/topic.ts
const route = {
	path: "/topic/:topic",
	categories: ["social-media"],
	view: 1,
	example: "/plurk/topic/standwithukraine",
	parameters: { topic: "Topic ID, can be found in URL" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["plurk.com/topic/:topic"] }],
	name: "Topic",
	maintainers: ["TonyRL"],
	handler
};
async function handler(ctx) {
	const topic = ctx.req.param("topic");
	const { data: pageResponse } = await got_default(`${baseUrl}/topic/${topic}`);
	const { data: apiResponse } = await got_default(`${baseUrl}/topic/getPlurks`, { searchParams: {
		topic,
		offset: 0,
		limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 30
	} });
	const $ = load(pageResponse);
	delete apiResponse.pids;
	delete apiResponse.count;
	const names = await fetchFriends(Object.values(apiResponse).map((item) => item.user_id));
	const items = await Promise.all(Object.values(apiResponse).map((item) => getPlurk(`plurk:${item.plurk_id}`, item, names[item.user_id].display_name)));
	return {
		title: $("head title").text(),
		description: $("meta[property=og:description]").attr("content"),
		image: $("meta[property=og:image]").attr("content") || $("meta[name=msapplication-TileImage]").attr("content"),
		link: `${baseUrl}/topic/${topic}`,
		item: items
	};
}
//#endregion
export { route };
