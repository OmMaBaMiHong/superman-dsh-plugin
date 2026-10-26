import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
//#region lib/routes/hypergryph/arknights/japan.ts
const route = {
	path: "/arknights/japan",
	categories: ["game"],
	example: "/hypergryph/arknights/japan",
	radar: [{ source: ["ak.arknights.jp/news", "ak.arknights.jp/"] }],
	name: "アークナイツ (日服新闻)",
	maintainers: ["ofyark"],
	handler,
	url: "ak.arknights.jp/news"
};
async function handler(ctx) {
	return {
		title: "アークナイツ",
		link: "https://www.arknights.jp/news",
		description: "アークナイツ ニュース",
		language: "ja",
		item: (await rofetch("https://www.arknights.jp:10014/news", { query: {
			lang: "ja",
			limit: ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 9,
			page: 1
		} })).data.items.map((item) => ({
			title: item.title,
			description: item.content[0].value,
			pubDate: parseDate(item.publishedAt),
			link: `https://www.arknights.jp/news/${item.id}`
		}))
	};
}
//#endregion
export { route };
