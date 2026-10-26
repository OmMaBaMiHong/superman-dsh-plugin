import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { load } from "cheerio";
//#region lib/routes/liveuamap/index.ts
const route = {
	path: "/:region?",
	categories: ["new-media"],
	example: "/liveuamap",
	parameters: { region: "region 热点地区，默认为`ukraine`，其他选项见liveuamap.com的三级域名" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["liveuamap.com/:region*"],
		target: "/:region"
	}],
	name: "实时消息",
	maintainers: ["CoderSherlock"],
	handler
};
async function handler(ctx) {
	const region = ctx.req.param("region") ?? "ukraine";
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50;
	if (!isValidHost(region)) throw new InvalidParameterError("Invalid region");
	const url = `https://${region}.liveuamap.com/`;
	const $ = load((await got_default({
		method: "get",
		url
	})).data);
	const items = $("div#feedler > div").slice(0, limit).toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("div.title").text(),
			description: item.find("div.title").text(),
			link: item.attr("data-link")
		};
	});
	return {
		title: `Liveuamap - ${region}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
