import { t as getContent } from "./common-D8IxsmLT.mjs";
//#region lib/routes/hunau/ied.ts
const route = {
	path: "/ied/:type?/:category?/:page?",
	categories: ["university"],
	example: "/hunau/ied",
	parameters: {
		type: "页面归属，默认为 `xwzx`",
		category: "页面分类，默认为 `ggtz`",
		page: "页码，默认为 `1`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"xky.hunau.edu.cn/",
			"xky.hunau.edu.cn/tzgg_8472",
			"xky.hunau.edu.cn/:category"
		],
		target: "/:category"
	}],
	name: "国际交流与合作处、国际教育学院、港澳台事务办公室",
	maintainers: ["lcandy2"],
	handler,
	url: "xky.hunau.edu.cn/",
	description: `| 分类     | 公告通知 | 新闻快讯 | 其他分类... |
| -------- | -------- | -------- | ----------- |
| type     | xwzx     | xwzx     | 对应 URL    |
| category | tzgg     | xwkx     | 对应 URL    |`
};
async function handler(ctx) {
	await getContent(ctx, {
		baseHost: "https://ied.hunau.edu.cn",
		baseCategory: "ggtz",
		baseType: "xwzx",
		baseTitle: "国际交流与合作处",
		baseDescription: "湖南农业大学国际交流与合作处、国际教育学院、港澳台事务办公室",
		baseDeparment: "ied"
	});
}
//#endregion
export { route };
