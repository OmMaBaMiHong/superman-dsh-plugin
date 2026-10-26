import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as parseList, t as parseItem } from "./utils-BE0LVhAw.mjs";
//#region lib/routes/guokr/channel.ts
const channelMap = {
	calendar: "pac",
	institute: "predator",
	foodlab: "predator",
	pretty: "beauty"
};
const route = {
	path: "/column/:channel",
	categories: ["new-media"],
	example: "/guokr/column/calendar",
	parameters: { channel: "专栏类别" },
	radar: [{ source: ["guokr.com/:channel"] }],
	name: "果壳网专栏",
	maintainers: ["DHPO", "hoilc"],
	handler,
	url: "guokr.com/",
	description: `| 物种日历 | 吃货研究所 | 美丽也是技术活 |
| -------- | ---------- | -------------- |
| calendar | institute  | beauty         |`
};
async function handler(ctx) {
	const { data: response } = await got_default("https://www.guokr.com/apis/minisite/article.json", { searchParams: {
		retrieve_type: "by_wx",
		channel_key: channelMap[ctx.req.param("channel")] ?? ctx.req.param("channel"),
		offset: 0,
		limit: 10
	} });
	const result = parseList(response.result);
	if (result.length === 0) throw new InvalidParameterError("Unknown channel");
	const channelName = result[0].channels[0].name;
	const channelUrl = result[0].channels[0].url;
	const items = await Promise.all(result.map((item) => parseItem(item)));
	return {
		title: `果壳网 ${channelName}`,
		link: channelUrl,
		item: items
	};
}
//#endregion
export { route };
