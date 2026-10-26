import { t as handler } from "./cmse-BWbAd8nZ.mjs";
//#region lib/routes/gov/cmse/kpjy.ts
const route = {
	path: "/kpjy/:id",
	name: "科普教育",
	example: "/gov/cmse/kpjy/kphd",
	parameters: { id: "分类 id，见下表，可在对应分类页 URL 中找到" },
	description: `| 科普活动 | 太空课堂 | 航天知识 |
| -------- | -------- | -------- |
| kphd     | tkkt     | ttzs     |`,
	radar: [{ source: ["www.cmse.gov.cn/kpjy/:id"] }],
	maintainers: ["nczitzk"],
	handler
};
//#endregion
export { route };
