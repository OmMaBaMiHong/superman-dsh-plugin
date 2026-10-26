import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
//#region lib/routes/openrice/voting.ts
const baseUrl = "https://www.openrice.com";
const route = {
	path: "/:lang/hongkong/voting/top/:categoryKey",
	maintainers: ["after9"],
	handler,
	categories: ["shopping"],
	example: "/openrice/zh/hongkong/voting/top/chinese",
	parameters: {
		lang: "语言，缺省为 zh",
		categoryKey: "类别，缺省为 chinese"
	},
	name: "OpenRice 開飯熱店 - 年度餐廳投票",
	description: `lang: 语言，见下方列表

| 简体  | 繁體 | EN |
| ----- | ---- | -- |
| zh-cn | zh   | en |

categoryKey: 部分类别，见下方列表 (更多的类别可以在页面的 link 中对照获取)

| 中菜館  | 上海菜       | 粵菜      | 川菜    | 港式    | 粥粉麵店        | 廚師發辦 | 韓國菜 | 泰國菜 | 越南菜     |
| ------- | ------------ | --------- | ------- | ------- | --------------- | -------- | ------ | ------ | ---------- |
| chinese | shanghainese | guangdong | sichuan | hkstyle | congee\\_noodles | omakase  | korean | thai   | vietnamese |`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "zh";
	const categoryKey = ctx.req.param("categoryKey") ?? "chinese";
	const urlPath = `/${lang}/hongkong/voting/top`;
	let title, description;
	switch (lang) {
		case "zh-cn":
			title = "OpenRice 开饭热店";
			description = "OpenRice用戶可以在網站或手機應用程式，點擊餐廳頁面中「投票」按鈕，即可完成投票。參加投票的用戶有機會參加大抽獎，贏取豐富獎品。";
			break;
		case "en":
			title = "OpenRice Best Restaurant";
			description = "OpenRice users can vote by clicking the &quot;Vote&quot; button on the restaurant page on the website or mobile app. Voters will have the opportunity to participate in the grand lottery and win grand prizes.";
			break;
		default:
			title = "OpenRice 開飯熱店";
			description = "OpenRice用戶可以在網站或手機應用程式，點擊餐廳頁面中「投票」按鈕，即可完成投票。參加投票的用戶有機會參加大抽獎，贏取豐富獎品。";
	}
	const resultList = (await rofetch("https://www.openrice.com/api/v2/voting/search/poi", {
		headers: { accept: "application/json" },
		query: {
			uiLang: lang,
			uiCity: "hongkong",
			categoryKey,
			shortlistIndexLt: 20,
			startAt: 0,
			regionId: 0,
			rows: 20,
			needTag: true,
			_isPrivate: true
		}
	})).paginationResult.results.map((item) => {
		const title = item.name ?? "";
		const link = `${baseUrl}/${lang}/hongkong/r-${item.name}-r${item.poiId}`;
		return {
			title,
			description: `${item.district.name}-${item.categories.map((category) => category.name).join("-")}`,
			link
		};
	});
	return {
		title,
		link: baseUrl + urlPath,
		description,
		item: resultList
	};
}
//#endregion
export { route };
