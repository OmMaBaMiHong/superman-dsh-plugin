import { t as handler } from "./zhengce-WB2Bp8g9.mjs";
//#region lib/routes/gov/zhengce/zuixin.ts
const route = {
	path: "/zuixin",
	categories: ["government"],
	example: "/gov/zhengce/zuixin",
	radar: [{ source: ["www.gov.cn/zhengce/zuixin.htm", "www.gov.cn/"] }],
	name: "最新政策",
	maintainers: ["SettingDust", "nczitzk"],
	handler,
	url: "www.gov.cn/zhengce/zuixin.htm"
};
//#endregion
export { route };
