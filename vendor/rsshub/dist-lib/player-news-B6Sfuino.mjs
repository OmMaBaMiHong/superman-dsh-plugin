import { t as utils_default } from "./utils-DeMTu6W2.mjs";
//#region lib/routes/dongqiudi/player-news.ts
const route = {
	path: "/player_news/:id",
	categories: ["sport"],
	example: "/dongqiudi/player_news/50000339",
	parameters: { id: "球员 id, 可在[懂球帝数据](https://www.dongqiudi.com/data)中通过其队伍找到" },
	radar: [{
		source: ["www.dongqiudi.com/player/*id"],
		target: (params) => `/dongqiudi/player_news/${params.id.replace(".html", "")}`
	}],
	name: "球员新闻",
	maintainers: ["HenryQW"],
	handler
};
async function handler(ctx) {
	const playerId = ctx.req.param("id");
	await utils_default.ProcessFeed(ctx, "player", playerId);
}
//#endregion
export { route };
