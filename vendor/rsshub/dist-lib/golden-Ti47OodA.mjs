import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/mi/golden.ts
const route = {
	path: "/golden",
	categories: ["program-update"],
	example: "/mi/golden",
	name: "小米应用商店金米奖",
	maintainers: ["nczitzk"],
	handler
};
async function handler() {
	const link = "https://app.market.xiaomi.com/apm/subject/169449?os=1.1.1&sdk=19";
	const response = await got_default({
		method: "get",
		url: link
	});
	return {
		title: "金米奖 - 小米应用商店",
		link,
		item: response.data.listApp.map((item) => ({
			title: `第${item.subjectGroup.split("期", 1)[0].replace("第", "")}期 ${item.displayName} [${item.level1CategoryName} - ${item.level2CategoryName}]`,
			link: `http://app.mi.com/details?id=${item.packageName}`,
			description: item.briefShow
		})),
		description: response.data.description
	};
}
//#endregion
export { route };
