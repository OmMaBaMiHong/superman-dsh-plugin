import { t as got_default } from "./got-Dnzt41dd.mjs";
import { i as parseList, n as host, r as parseItems, t as acw_sc__v2 } from "./utils-BNdZnnDL.mjs";
import { load } from "cheerio";
//#region lib/routes/segmentfault/channel.ts
const route = {
	path: "/channel/:name",
	categories: ["programming"],
	example: "/segmentfault/channel/frontend",
	parameters: { name: "频道名称，在频道 URL 可以找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["segmentfault.com/channel/:name"] }],
	name: "频道",
	maintainers: ["LogicJake", "Fatpandac"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const link = `${host}/channel/${name}`;
	const { data: pageResponse } = await got_default(link);
	const { data: apiResponse } = await got_default(`${host}/gateway/articles`, { searchParams: {
		query: "channel",
		slug: name,
		offset: 0,
		size: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 20,
		mode: "scrollLoad"
	} });
	const channelName = load(pageResponse)("#leftNav > a.active").text();
	const list = parseList(apiResponse.rows);
	const acwScV2Cookie = await acw_sc__v2(list[0].link);
	const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item)));
	return {
		title: `segmentfault - ${channelName}`,
		link,
		item: items
	};
}
//#endregion
export { route };
