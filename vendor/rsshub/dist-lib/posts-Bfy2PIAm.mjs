import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/weekendhk/posts.ts
const route = {
	path: "/",
	example: "/weekendhk",
	radar: [{ source: ["weekendhk.com/"] }],
	name: "最新文章",
	maintainers: ["TonyRL"],
	handler,
	url: "weekendhk.com/"
};
async function handler(ctx) {
	const baseUrl = "https://www.weekendhk.com";
	const items = (await got_default(`${baseUrl}/wp-json/wp/v2/posts`, { searchParams: { per_page: ctx.req.query("limit") ?? 100 } })).data.map((item) => ({
		title: item.title.rendered,
		link: item.link,
		guid: item.guid.rendered,
		description: item.content.rendered,
		pubDate: parseDate(item.date_gmt),
		author: item.creator_editor
	}));
	return {
		title: "新假期周刊",
		description: "新假期周刊網站為全港最強吃喝玩樂搵節目平台。網羅世界各地最詳盡旅遊潮流資訊；最新鮮熱辣本地飲食情報；最好玩周末玩樂節目，即時瞓身報導，全天候為你update。",
		link: baseUrl,
		language: "zh-HK",
		image: `${baseUrl}/wp-content/themes/bucket/theme-content/images/196x196.png`,
		item: items
	};
}
//#endregion
export { route };
