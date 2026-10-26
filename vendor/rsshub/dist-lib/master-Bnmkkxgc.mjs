import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { n as parsePage, t as baseUrl } from "./utils-BSOSMbsG.mjs";
//#region lib/routes/cw/master.ts
const route = {
	path: "/master/:channel",
	categories: ["traditional-media"],
	example: "/cw/master/8",
	parameters: { channel: "主頻道 ID，可在 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "主頻道",
	maintainers: ["TonyRL"],
	handler,
	description: `| 主頻道名稱 | 主頻道 ID |
| ---------- | --------- |
| 財經       | 8         |
| 產業       | 7         |
| 國際       | 9         |
| 管理       | 10        |
| 環境       | 12        |
| 教育       | 13        |
| 人物       | 14        |
| 政治社會   | 77        |
| 調查排行   | 15        |
| 健康關係   | 79        |
| 時尚品味   | 11        |
| 運動生活   | 103       |
| 重磅外媒   | 16        |`
};
async function handler(ctx) {
	const context = await outPlaywright();
	const { $, items } = await parsePage("master", context, ctx);
	await context.close();
	return {
		title: $("head title").text(),
		description: $("meta[name=description]").attr("content"),
		link: `${baseUrl}/masterChannel.action?idMasterChannel=${ctx.req.param("channel")}`,
		image: `${baseUrl}/assets_new/img/fbshare.jpg`,
		language: $("meta[property=\"og:locale\"]").attr("content"),
		item: items
	};
}
//#endregion
export { route };
