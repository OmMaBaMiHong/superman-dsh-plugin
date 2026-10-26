import { t as handler } from "./cmse-BWbAd8nZ.mjs";
//#region lib/routes/gov/cmse/kjkx.ts
const route = {
	path: "/kjkx/:id",
	name: "空间科学",
	example: "/gov/cmse/kjkx/kjkxyjyyy",
	parameters: { id: "分类 id，见下表，可在对应分类页 URL 中找到" },
	description: `| 空间科学研究与应用 | 航天技术试验 | 航天医学实验 |
| ------------------ | ------------ | ------------ |
| kjkxyjyyy          | htjssy       | htyxsy       |`,
	radar: [{ source: ["www.cmse.gov.cn/kjkx/:id"] }],
	maintainers: ["nczitzk"],
	handler
};
//#endregion
export { route };
