import { n as parseArticle, r as parseRollNewsList, t as getRollNewsList } from "./utils-DEYcDo1v2.mjs";
//#region lib/routes/sina/chuangshiji.ts
const route = {
	path: "/csj",
	categories: ["new-media"],
	example: "/sina/csj",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["tech.sina.com.cn/chuangshiji", "tech.sina.com.cn/"] }],
	name: "专栏 - 创事记",
	maintainers: ["xapool"],
	handler,
	url: "tech.sina.com.cn/chuangshiji"
};
async function handler(ctx) {
	const pageid = "402";
	const lid = "2559";
	const { limit = "50" } = ctx.req.query();
	const list = parseRollNewsList((await getRollNewsList(pageid, lid, limit)).data.result.data);
	return {
		title: "新浪专栏-创事记",
		link: "https://tech.sina.com.cn/chuangshiji",
		item: await Promise.all(list.map((item) => parseArticle(item)))
	};
}
//#endregion
export { route };
