import { t as got_default } from "./got-Dnzt41dd.mjs";
import { d as processItems, l as fetchMemberData, r as apiMemberRootUrl, s as buildHuxiuRouteTitlePrefix } from "./util-CislQG2a.mjs";
//#region lib/routes/huxiu/member.ts
const route = {
	path: ["/author/:id/:type?", "/member/:id/:type?"],
	name: "用户",
	example: "/huxiu/member/2313050",
	categories: ["new-media"],
	parameters: { id: "用户 id，可在对应用户页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	maintainers: ["nczitzk"],
	handler,
	description: `| TA 的文章 | TA 的 24 小时 |
| --------- | ------------- |
| article   | moment        |`
};
async function handler(ctx) {
	const { id, type = "article" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 10;
	const apiUrl = new URL(`web/${type}/${type}List`, apiMemberRootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		platform: "www",
		uid: id
	} });
	return {
		item: await processItems(response.data.datalist, limit),
		...await fetchMemberData(id, type, response.data.datalist ?? [], buildHuxiuRouteTitlePrefix(route.name))
	};
}
//#endregion
export { route };
