import "./types-DNj6Etbg.mjs";
import { t as ProcessFeed } from "./utils-DuePKZQo.mjs";
//#region lib/routes/hpoi/character.ts
const route = {
	path: "/items/character/:id/:order?",
	categories: ["anime"],
	view: 2,
	example: "/hpoi/items/character/1035374",
	parameters: {
		id: "角色 ID",
		order: {
			description: "排序",
			options: [
				{
					value: "release",
					label: "发售"
				},
				{
					value: "add",
					label: "入库"
				},
				{
					value: "hits",
					label: "总热度"
				},
				{
					value: "hits7Day",
					label: "一周热度"
				},
				{
					value: "hitsDay",
					label: "一天热度"
				},
				{
					value: "rating",
					label: "评价"
				}
			],
			default: "add"
		}
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "角色周边",
	maintainers: ["DIYgod"],
	handler
};
async function handler(ctx) {
	return await ProcessFeed("character", ctx.req.param("id"), ctx.req.param("order"));
}
//#endregion
export { route };
