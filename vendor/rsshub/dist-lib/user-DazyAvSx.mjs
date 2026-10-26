import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { i as parseList, n as host, r as parseItems, t as acw_sc__v2 } from "./utils-BNdZnnDL.mjs";
//#region lib/routes/segmentfault/user.ts
const route = {
	path: "/user/:name",
	categories: ["programming"],
	example: "/segmentfault/user/minnanitkong",
	parameters: { name: "用户 Id，用户详情页 URL 可以找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["segmentfault.com/u/:name"] }],
	name: "用户",
	maintainers: ["leyuuu", "Fatpandac"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const data = (await rofetch(`${host}/gateway/homepage/${name}/timeline?size=20&offset=`)).rows;
	const list = parseList(data);
	const { author } = list[0];
	const acwScV2Cookie = await acw_sc__v2(list[0].link);
	const items = await Promise.all(list.map((item) => parseItems(acwScV2Cookie, item)));
	return {
		title: `segmentfault - ${author}`,
		link: `${host}/u/${name}`,
		item: items
	};
}
//#endregion
export { route };
