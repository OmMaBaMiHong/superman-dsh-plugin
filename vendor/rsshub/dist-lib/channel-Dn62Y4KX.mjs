import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as utils_default } from "./utils-Bcc1WW3J.mjs";
import { load } from "cheerio";
//#region lib/routes/thepaper/channel.ts
const route = {
	path: "/channel/:id",
	categories: ["new-media"],
	example: "/thepaper/channel/25950",
	parameters: { id: "频道 id，可在频道页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "频道",
	maintainers: [
		"xyqfer",
		"nczitzk",
		"bigfei"
	],
	handler,
	description: `| 频道 ID | 频道名 |
| ------- | ------ |
| 26916   | 视频   |
| 108856  | 战疫   |
| 25950   | 时事   |
| 25951   | 财经   |
| 36079   | 澎湃号 |
| 119908  | 科技   |
| 25952   | 思想   |
| 119489  | 智库   |
| 25953   | 生活   |
| 26161   | 问吧   |
| 122908  | 国际   |
| -21     | 体育   |
| -24     | 评论   |`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const channelUrl = `https://m.thepaper.cn/channel/${id}`;
	const channelUrlResp = await rofetch(channelUrl);
	const nextData = load(channelUrlResp.data)("#__NEXT_DATA__").text();
	const channelUrlData = JSON.parse(nextData);
	const list = (await rofetch("https://api.thepaper.cn/contentapi/nodeCont/getByChannelId", {
		method: "POST",
		body: { channelId: id }
	})).data.list;
	const items = await Promise.all(list.map((item) => utils_default.ProcessItem(item, ctx)));
	return {
		title: `澎湃新闻频道 - ${utils_default.ChannelIdToName(id, channelUrlData)}`,
		link: channelUrl,
		item: items,
		itunes_author: "澎湃新闻",
		image: utils_default.ExtractLogo(channelUrlResp)
	};
}
//#endregion
export { route };
