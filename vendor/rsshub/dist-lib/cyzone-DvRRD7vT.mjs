import { i as rootUrl, n as getInfo, r as processItems, t as apiRootUrl } from "./util-C564YIaS.mjs";
//#region lib/routes/cyzone/index.ts
const route = {
	path: ["/channel/:id?", "/:id?"],
	radar: [{
		source: ["cyzone.cn/channel/:id", "cyzone.cn/"],
		target: "/:id"
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	description: `| 最新 | 快鲤鱼 | 创投 | 科创板 | 汽车 |
| ---- | ------ | ---- | ------ | ---- |
| news | 5      | 14   | 13     | 8    |

| 海外 | 消费 | 科技 | 医疗 | 文娱 |
| ---- | ---- | ---- | ---- | ---- |
| 10   | 9    | 7    | 27   | 11   |

| 城市 | 政策 | 特写 | 干货 | 科技股 |
| ---- | ---- | ---- | ---- | ------ |
| 16   | 15   | 6    | 12   | 33     |`
};
async function handler(ctx) {
	const { id = "news" } = ctx.req.param();
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 5;
	const apiUrl = new URL(`v2/content/channel/${id === "news" ? "getArticle" : "detail"}`, apiRootUrl).href;
	const currentUrl = new URL(`channel/${id}`, rootUrl).href;
	return {
		item: await processItems(apiUrl, limit, id === "news" ? {} : { channel_id: id }),
		...await getInfo(currentUrl)
	};
}
//#endregion
export { route };
