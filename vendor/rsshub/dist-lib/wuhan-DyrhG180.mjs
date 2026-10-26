import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tingshuitz/wuhan.ts
const baseUrl = "https://www.whwater.com";
const route = {
	path: "/wuhan/:channelId?",
	radar: [{
		source: ["whwater.com/IWater.shtml", "whwater.com/"],
		target: "/wuhan"
	}],
	name: "Unknown",
	maintainers: [],
	handler,
	url: "whwater.com/IWater.shtml"
};
async function handler(ctx) {
	const { channelId = 68 } = ctx.req.param();
	const data = (await got_default.post("https://manager.whwater.com:8900/website/article/findChannelArticle", { form: {
		channelId,
		searchKey: "",
		thumbnailStatus: 0,
		topStatus: 0,
		recommendStatus: 0,
		page: 1,
		size: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30
	} })).data.data;
	const items = data.articleArray.map((item) => ({
		title: item.title,
		description: item.content,
		pubDate: parseDate(item.publishTime),
		link: `https://${baseUrl}/IPolicyDetails.shtml?id=31&sid=${channelId}${item.articleLink}`
	}));
	return {
		title: `${data.channelName}通知 - 武汉市水务集团有限公司`,
		link: `${baseUrl}/IWater.shtml?id=31&sid=48`,
		item: items
	};
}
//#endregion
export { route };
