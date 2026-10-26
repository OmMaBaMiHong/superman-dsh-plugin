import { t as handler } from "./cmse-BWbAd8nZ.mjs";
//#region lib/routes/gov/cmse/hqsy.ts
const route = {
	path: "/hqsy/:id",
	name: "环球视野",
	example: "/gov/cmse/hqsy/zxdta",
	parameters: { id: "分类 id，见下表，可在对应分类页 URL 中找到" },
	description: `| 最新动态 | 美国 | 俄罗斯 | 欧洲 | 日本 | 印度 | 领域动态 |
| -------- | ---- | ------ | ---- | ---- | ---- | -------- |
| zxdta    | mg   | els    | oz   | rb   | yd   | lydt     |`,
	radar: [{ source: ["www.cmse.gov.cn/hqsy/:id"] }],
	maintainers: ["nczitzk"],
	handler
};
//#endregion
export { route };
