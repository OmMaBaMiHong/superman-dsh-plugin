import { t as handler } from "./gz-DvUf1A58.mjs";
//#region lib/routes/gov/gz/xw.ts
const route = {
	path: "/xw/:category",
	name: "新闻",
	example: "/gov/gz/xw/gzyw",
	parameters: { category: "新闻分类" },
	radar: [{ source: ["www.gz.gov.cn/xw/:category"] }],
	maintainers: ["drgnchan"],
	handler,
	description: `| 广州要闻 | 今日头条 | 通知公告 |
| -------- | -------- | -------- |
| gzyw     | jrtt     | tzgg     |`
};
//#endregion
export { route };
